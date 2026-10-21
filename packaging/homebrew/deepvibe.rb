# Homebrew formula for DeepVibe.
#
# Lives in the tap repository `deepvibe-eu/homebrew-tap` at
# `Formula/deepvibe.rb`. Users then run:
#
#   brew tap deepvibe-eu/tap
#   brew install deepvibe
#
# macOS (arm64) and Linux (AppImage) are served from one formula, selected
# automatically via on_macos/on_linux. Only releases that exist are wired up;
# an Intel Mac currently has no artifact and fails cleanly.
#
# NOTE: the macOS build is currently unsigned/unnotarized, so Gatekeeper will
# quarantine it (right-click -> Open once). Sign + notarize before promoting.
#
# Refresh the hashes with packaging/homebrew/print-checksums.sh.
class Deepvibe < Formula
  desc "The (unofficial) DeepSeek coding partner IDE"
  homepage "https://deepvibe.eu"
  version "1.0.5"
  license "Apache-2.0"

  on_macos do
    on_arm do
      url "https://github.com/deepvibe-eu/DeepVibe/releases/download/v1.0.5/DeepVibe-1.0.5-mac-arm64.zip"
      sha256 "a3cc3cdfa209334bb18ed6871639f7dbee3b4a53d2cacf47d64576906d9a0e9e"
    end

    def install
      prefix.install "DeepVibe.app"
      bin.install_symlink prefix/"DeepVibe.app/Contents/MacOS/DeepVibe" => "deepvibe"
    end
  end

  on_linux do
    on_intel do
      url "https://github.com/deepvibe-eu/DeepVibe/releases/download/v1.0.5/DeepVibe-1.0.5-linux-x86_64.AppImage"
      sha256 "c06c02b28638678791e2b44ef2f07dd0638ec711ff6ce25ea54c033a76d49c47"
    end

    def install
      bin.install "DeepVibe-1.0.5-linux-x86_64.AppImage" => "deepvibe"
    end
  end
end
