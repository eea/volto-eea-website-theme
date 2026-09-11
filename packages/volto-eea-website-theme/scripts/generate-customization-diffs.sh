#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
package_root="$(cd "${script_dir}/.." && pwd)"
migration_root="$(cd "${package_root}/../../../.." && pwd)"
customizations_root="${package_root}/src/customizations"
volto_root="${VOLTO_SOURCE_ROOT:-${migration_root}/volto}"

if [[ ! -f "${volto_root}/packages/volto/package.json" ]]; then
  echo "Volto source checkout not found: ${volto_root}" >&2
  exit 1
fi

volto_version="$(node -p "require('${volto_root}/packages/volto/package.json').version")"
volto_commit="$(git -C "${volto_root}" rev-parse --short=9 HEAD)"

total=0
changed=0
identical=0
without_upstream=0

while IFS= read -r -d '' customization; do
  relative_path="${customization#${customizations_root}/}"
  upstream=""

  case "${relative_path}" in
    volto/*)
      upstream="${volto_root}/packages/volto/src/${relative_path#volto/}"
      ;;
    @plone/volto-slate/*)
      upstream="${volto_root}/packages/volto-slate/src/${relative_path#@plone/volto-slate/}"
      ;;
  esac

  if [[ -n "${upstream}" && ! -f "${upstream}" ]]; then
    upstream_stem="${upstream%.*}"
    for extension in js jsx ts tsx css less; do
      if [[ -f "${upstream_stem}.${extension}" ]]; then
        upstream="${upstream_stem}.${extension}"
        break
      fi
    done
  fi

  canonical_diff="${customization}.diff"
  legacy_diff="${customization%.*}.diff"
  if [[ -f "${canonical_diff}" ]]; then
    output="${canonical_diff}"
  elif [[ "${customization}" =~ \.(js|jsx|ts|tsx)$ && -f "${legacy_diff}" ]]; then
    output="${legacy_diff}"
  else
    output="${canonical_diff}"
  fi

  temporary_output="$(mktemp)"
  if [[ -n "${upstream}" && -f "${upstream}" ]]; then
    upstream_label="volto-${volto_version}-${volto_commit}/${upstream#${volto_root}/}"
    customization_label="volto-eea-website-theme/${customization#${package_root}/}"

    if cmp -s "${upstream}" "${customization}"; then
      printf '# No differences from %s (%s).\n' \
        "${upstream_label}" "${customization_label}" > "${temporary_output}"
      identical=$((identical + 1))
    else
      diff_status=0
      diff -u \
        --label "${upstream_label}" \
        --label "${customization_label}" \
        "${upstream}" "${customization}" > "${temporary_output}" || diff_status=$?
      if [[ ${diff_status} -ne 1 ]]; then
        rm -f "${temporary_output}"
        exit "${diff_status}"
      fi
      changed=$((changed + 1))
    fi
  else
    customization_label="volto-eea-website-theme/${customization#${package_root}/}"
    diff_status=0
    diff -u \
      --label "volto-${volto_version}-${volto_commit}/NO_UPSTREAM_FILE" \
      --label "${customization_label}" \
      /dev/null "${customization}" > "${temporary_output}" || diff_status=$?
    if [[ ${diff_status} -ne 1 ]]; then
      rm -f "${temporary_output}"
      exit "${diff_status}"
    fi
    without_upstream=$((without_upstream + 1))
  fi

  mv "${temporary_output}" "${output}"
  total=$((total + 1))
done < <(
  find "${customizations_root}" -type f \
    ! -name '*.diff' \
    -print0 | sort -z
)

printf 'Generated %d customization diffs against Volto %s (%s): %d changed, %d identical, %d without upstream.\n' \
  "${total}" "${volto_version}" "${volto_commit}" \
  "${changed}" "${identical}" "${without_upstream}"
