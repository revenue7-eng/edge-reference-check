//! Level 3 adapter for check.html: one envelope, one reference set.
//!
//! Exports a C ABI so the page needs no generated glue. Inputs are copied into
//! buffers obtained from `erc_alloc`; the result is a numeric code (see `code`).
//! A detail string for the last call is exposed through `erc_detail_ptr/len`.
//! No state survives between calls except that string.

use attest_appraise::{check, reference_from_rim, Outcome, Reason};
use p256::ecdsa::VerifyingKey;
use p256::pkcs8::DecodePublicKey;

static mut DETAIL: Vec<u8> = Vec::new();

fn set_detail(s: &str) {
    unsafe { DETAIL = s.as_bytes().to_vec(); }
}

#[no_mangle]
pub extern "C" fn erc_alloc(len: usize) -> *mut u8 {
    let mut v = Vec::<u8>::with_capacity(len.max(1));
    let p = v.as_mut_ptr();
    core::mem::forget(v);
    p
}

#[no_mangle]
pub unsafe extern "C" fn erc_free(ptr: *mut u8, len: usize) {
    drop(Vec::from_raw_parts(ptr, 0, len.max(1)));
}

#[no_mangle]
pub extern "C" fn erc_detail_ptr() -> *const u8 {
    unsafe { core::ptr::addr_of!(DETAIL).as_ref().unwrap().as_ptr() }
}

#[no_mangle]
pub extern "C" fn erc_detail_len() -> usize {
    unsafe { core::ptr::addr_of!(DETAIL).as_ref().unwrap().len() }
}

unsafe fn slice<'a>(p: *const u8, n: usize) -> &'a [u8] {
    if n == 0 { &[] } else { core::slice::from_raw_parts(p, n) }
}

fn code(r: Reason) -> u32 {
    match r {
        Reason::Accepted => 0,
        Reason::SignatureFail => 1,
        Reason::UnknownDevice => 2,
        Reason::Malformed => 3,
        Reason::EvidenceBindingFail => 4,
        Reason::UnrecognizedState => 5,
        Reason::EvidenceUnparseable => 6,
        Reason::EvidenceMissing(_) => 7,
        Reason::EvidenceUnrecognized(_) => 8,
        // Never produced by this crate's check; kept distinct so a change upstream is visible.
        Reason::Stale => 90,
        Reason::PersistFail => 91,
    }
}

/// Codes 100 and above: the inputs could not be turned into a check at all.
///   100  device key is not a P-256 SubjectPublicKeyInfo (DER)
///   101  RIM is not UTF-8
///   102  RIM could not be read as a reference set (detail has the reason)
#[no_mangle]
pub unsafe extern "C" fn erc_check(
    msg_p: *const u8, msg_n: usize,
    sig_p: *const u8, sig_n: usize,
    ev_p: *const u8, ev_n: usize,
    key_p: *const u8, key_n: usize,
    rim_p: *const u8, rim_n: usize,
) -> u32 {
    set_detail("");
    let key = match VerifyingKey::from_public_key_der(slice(key_p, key_n)) {
        Ok(k) => k,
        Err(e) => { set_detail(&format!("device key: {e}")); return 100; }
    };
    let rim = match core::str::from_utf8(slice(rim_p, rim_n)) {
        Ok(s) => s,
        Err(e) => { set_detail(&format!("RIM: {e}")); return 101; }
    };
    let refs = match reference_from_rim(rim) {
        Ok(r) => r,
        Err(e) => { set_detail(&e); return 102; }
    };
    let v = check(slice(msg_p, msg_n), slice(sig_p, sig_n), slice(ev_p, ev_n), &key, &refs);
    set_detail(&format!("{:?}", v.reason));
    debug_assert_eq!(v.outcome == Outcome::Accept, v.reason == Reason::Accepted);
    code(v.reason)
}
