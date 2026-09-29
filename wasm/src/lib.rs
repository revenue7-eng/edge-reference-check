//! Level 3 adapter for check.html: one envelope v2, one reference set.
//!
//! Exports a C ABI so the page needs no generated glue. Inputs are copied into
//! buffers obtained from `erc_alloc`; the result is a numeric code (see `code`).
//! A detail string and the TPM name of the attestation key for the last call are
//! exposed through `erc_detail_ptr/len` and `erc_name_ptr/len`. No state survives
//! between calls except those two.
//!
//! Only envelope v2 (a TPM2_Quote under a restricted attestation key, DDR-004) is
//! accepted. A v1 envelope is signed by a key the device holds in software, so
//! nothing binds its PCR values to a TPM; that is not level 3, and this page does
//! not offer a path for it.

use attest_appraise::{appraise, authenticate_envelope, reference_from_rim, AkKey, Outcome, Reason, TrustEntry};

static mut DETAIL: Vec<u8> = Vec::new();
static mut NAME: Vec<u8> = Vec::new();

fn set_detail(s: &str) {
    unsafe { DETAIL = s.as_bytes().to_vec(); }
}

fn set_name(b: &[u8]) {
    unsafe { NAME = b.to_vec(); }
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

/// TPM name of the attestation key (34 bytes: sha256 alg id, SHA-256 of
/// TPMT_PUBLIC), empty when the key was not accepted as an AK.
#[no_mangle]
pub extern "C" fn erc_name_ptr() -> *const u8 {
    unsafe { core::ptr::addr_of!(NAME).as_ref().unwrap().as_ptr() }
}

#[no_mangle]
pub extern "C" fn erc_name_len() -> usize {
    unsafe { core::ptr::addr_of!(NAME).as_ref().unwrap().len() }
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
        Reason::QuoteBindingFail => 9,
        // Never produced by this crate's check; kept distinct so a change upstream is visible.
        Reason::Stale => 90,
        Reason::PersistFail => 91,
    }
}

/// Codes 100 and above: the inputs could not be turned into a check at all.
///   101  RIM is not UTF-8
///   102  RIM could not be read as a reference set (detail has the reason)
///   103  the key is not a TPM2B_PUBLIC of an attestation key (detail has the reason)
#[no_mangle]
pub unsafe extern "C" fn erc_check_v2(
    msg_p: *const u8, msg_n: usize,
    att_p: *const u8, att_n: usize,
    sig_p: *const u8, sig_n: usize,
    ev_p: *const u8, ev_n: usize,
    ak_p: *const u8, ak_n: usize,
    rim_p: *const u8, rim_n: usize,
) -> u32 {
    set_detail("");
    set_name(&[]);
    // Same order as the steps on the page: reference set, then key, then envelope.
    let rim = match core::str::from_utf8(slice(rim_p, rim_n)) {
        Ok(s) => s,
        Err(e) => { set_detail(&format!("RIM: {e}")); return 101; }
    };
    let refs = match reference_from_rim(rim) {
        Ok(r) => r,
        Err(e) => { set_detail(&e); return 102; }
    };
    let ak = match AkKey::from_tpm2b_public(slice(ak_p, ak_n)) {
        Ok(k) => k,
        Err(e) => { set_detail(&e); return 103; }
    };
    set_name(ak.name());
    let entry = TrustEntry::Ak(ak);
    let v = match authenticate_envelope(slice(msg_p, msg_n), Some(slice(att_p, att_n)), slice(sig_p, sig_n),
                                        slice(ev_p, ev_n), |_| Some(entry)) {
        Ok(auth) => appraise(&auth, &refs),
        Err(e) => { set_detail(&e.detail); return code(e.reason.into()); }
    };
    set_detail(&format!("{:?}", v.reason));
    debug_assert_eq!(v.outcome == Outcome::Accept, v.reason == Reason::Accepted);
    code(v.reason)
}
