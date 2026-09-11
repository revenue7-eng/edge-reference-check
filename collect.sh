#!/bin/sh
# collect.sh: write a level-1 bundle for edge-reference-check.
#
# Usage:  collect.sh            writes /tmp/erc-bundle.txt
#         collect.sh PATH       writes PATH
#         collect.sh -          writes to stdout
#
# POSIX sh, BusyBox-safe, no dependencies beyond coreutils/busybox.
# Reads only. Needs root to read securityfs and config.gz on most systems.
# Every fact it cannot read is written as UNAVAILABLE, never guessed.

OUT="${1:-/tmp/erc-bundle.txt}"
# The temp file must live beside the target, not in /tmp: BusyBox mv copies the
# SELinux context across filesystems and vfat cannot store xattrs, so a move
# from tmpfs to a USB stick fails with "setfilecon: Operation not supported".
if [ "$OUT" = "-" ]; then
  TMP="/tmp/erc-bundle.$$"
else
  TMP="$OUT.$$"
fi

emit() { printf '%s\n' "$*" >> "$TMP"; }
key()  { printf 'KEY %s %s\n' "$1" "$2" >> "$TMP"; }

: > "$TMP" || { echo "cannot write $TMP" >&2; exit 1; }

emit "===EDGE-REFERENCE-CHECK BUNDLE v1==="
key bundle_version 1
key collector collect.sh-1
key uname_r "$(uname -r 2>/dev/null || echo UNAVAILABLE)"
key uname_m "$(uname -m 2>/dev/null || echo UNAVAILABLE)"

# ---- kernel command line -------------------------------------------------
if [ -r /proc/cmdline ]; then
  CL=$(cat /proc/cmdline)
  key cmdline_available yes
else
  CL=""
  key cmdline_available no
fi

ima=$(printf '%s' "$CL" | sed -n 's/.*ima_appraise=\([^ ]*\).*/\1/p')
[ -z "$ima" ] && ima=OFF
key ima_appraise "$ima"

rt=$(printf '%s' "$CL" | sed -n 's/.*\(root=[^ ]*\).*/\1/p')
[ -z "$rt" ] && rt=UNAVAILABLE
key root "$rt"

sl=$(printf '%s' "$CL" | sed -n 's/.*rauc\.slot=\([^ ]*\).*/\1/p')
[ -z "$sl" ] && sl=NONE
key slot "$sl"

# ---- SELinux --------------------------------------------------------------
if command -v getenforce >/dev/null 2>&1; then
  se=$(getenforce 2>/dev/null || echo UNAVAILABLE)
elif [ -r /sys/fs/selinux/enforce ]; then
  case "$(cat /sys/fs/selinux/enforce)" in
    1) se=Enforcing ;; 0) se=Permissive ;; *) se=UNAVAILABLE ;;
  esac
else
  se=NO-SELINUX
fi
key selinux "$se"

# ---- device-mapper --------------------------------------------------------
dm=$(ls /dev/mapper 2>/dev/null | grep -v '^control$' | tr '\n' ' ' | sed 's/ $//')
[ -z "$dm" ] && dm=NONE
key dm "$dm"

# ---- securityfs: lockdown, IMA ---------------------------------------------
if [ -r /sys/kernel/security/lockdown ]; then
  key lockdown "$(cat /sys/kernel/security/lockdown)"
else
  key lockdown UNAVAILABLE
fi

if [ -r /sys/kernel/security/ima/ascii_runtime_measurements ]; then
  key ima_measurements "$(wc -l < /sys/kernel/security/ima/ascii_runtime_measurements | tr -d ' ')"
else
  key ima_measurements UNAVAILABLE
fi

if [ -r /sys/kernel/security/ima/policy ]; then
  key ima_policy_available yes
else
  key ima_policy_available no
fi

if [ -d /sys/kernel/security ]; then
  key securityfs mounted
else
  key securityfs absent
fi

# ---- sysctls (read from /proc/sys, no sysctl binary needed) ---------------
sysctl_key() {
  # $1 = dotted name, $2 = /proc/sys path
  if [ -r "$2" ]; then key "sysctl.$1" "$(cat "$2")"; else key "sysctl.$1" UNAVAILABLE; fi
}
sysctl_key kernel.kptr_restrict            /proc/sys/kernel/kptr_restrict
sysctl_key kernel.dmesg_restrict           /proc/sys/kernel/dmesg_restrict
sysctl_key kernel.modules_disabled         /proc/sys/kernel/modules_disabled
sysctl_key kernel.unprivileged_bpf_disabled /proc/sys/kernel/unprivileged_bpf_disabled
sysctl_key kernel.yama.ptrace_scope        /proc/sys/kernel/yama/ptrace_scope
sysctl_key kernel.perf_event_paranoid      /proc/sys/kernel/perf_event_paranoid

# ---- kernel config --------------------------------------------------------
CFG=""
if [ -r /proc/config.gz ]; then
  CFG=/proc/config.gz; CFGHOW=zcat
elif [ -r "/boot/config-$(uname -r)" ]; then
  CFG="/boot/config-$(uname -r)"; CFGHOW=cat
fi
if [ -n "$CFG" ]; then
  key config_available yes
  key config_source "$CFG"
else
  key config_available no
fi

# ---- sections -------------------------------------------------------------
emit "===SECTION cmdline==="
[ -n "$CL" ] && emit "$CL"

emit "===SECTION ima_policy==="
[ -r /sys/kernel/security/ima/policy ] && cat /sys/kernel/security/ima/policy >> "$TMP"

emit "===SECTION config==="
if [ -n "$CFG" ]; then
  $CFGHOW "$CFG" 2>/dev/null | grep -E '^(CONFIG_|# CONFIG_.* is not set)' >> "$TMP"
fi

emit "===END==="

# ---- deliver --------------------------------------------------------------
if [ "$OUT" = "-" ]; then
  cat "$TMP"; rm -f "$TMP"; exit 0
fi
mv "$TMP" "$OUT" || { echo "cannot write $OUT" >&2; rm -f "$TMP"; exit 1; }
printf 'bundle  %s\nbytes   %s\n' "$OUT" "$(wc -c < "$OUT" | tr -d ' ')"
if command -v sha256sum >/dev/null 2>&1; then sha256sum "$OUT"; fi
