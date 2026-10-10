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
  homepage "https://github.com/deepvibe-eu/DeepVibe"
  version "1.0.2"
  license "Apache-2.0"

  on_macos do
    on_arm do
      url "https://github.com/deepvibe-eu/DeepVibe/releases/download/v1.0.2/DeepVibe-1.0.2-mac-arm64.zip"
      sha256 "439399dcec80b2a561eb1cfb0a0c899dfdb6caaa1ce22f720d02ca51e3f2a4f4"
    end

    def install
      prefix.install "DeepVibe.app"
      bin.install_symlink prefix/"DeepVibe.app/Contents/MacOS/DeepVibe" => "deepvibe"
    end
  end

  on_linux do
    on_intel do
      url "https://github.com/deepvibe-eu/DeepVibe/releases/download/v1.0.2/DeepVibe-1.0.2-linux-x86_64.AppImage"
      sha256 "dbb13c8193890b7db57628c800c7f91794c41aefdb46e4fd69e254b4c3e2fd34"
    end

    def install
      bin.install "DeepVibe-1.0.2-linux-x86_64.AppImage" => "deepvibe"
    end
  end
end
