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
  version "1.0.3"
  license "Apache-2.0"

  on_macos do
    on_arm do
      url "https://github.com/deepvibe-eu/DeepVibe/releases/download/v1.0.3/DeepVibe-1.0.3-mac-arm64.zip"
      sha256 "6732195abe14b495f791ce953335965cd9f417aa1c101a50916e6ee9a31ee22c"
    end

    def install
      prefix.install "DeepVibe.app"
      bin.install_symlink prefix/"DeepVibe.app/Contents/MacOS/DeepVibe" => "deepvibe"
    end
  end

  on_linux do
    on_intel do
      url "https://github.com/deepvibe-eu/DeepVibe/releases/download/v1.0.3/DeepVibe-1.0.3-linux-x86_64.AppImage"
      sha256 "a9fc6e079010b5f1938ccc41324807c3cd466842df8f040249fb09b8688cecef"
    end

    def install
      bin.install "DeepVibe-1.0.3-linux-x86_64.AppImage" => "deepvibe"
    end
  end
end
