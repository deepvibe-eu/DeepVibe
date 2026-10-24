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
  version "1.0.6"
  license "Apache-2.0"

  on_macos do
    on_arm do
      url "https://github.com/deepvibe-eu/DeepVibe/releases/download/v1.0.6/DeepVibe-1.0.6-mac-arm64.zip"
      sha256 "d51541c96fdc6b6669cf1b4cfe8046fd366ff12d26004c57d5a26e1882168aa0"
    end

    def install
      prefix.install "DeepVibe.app"
      bin.install_symlink prefix/"DeepVibe.app/Contents/MacOS/DeepVibe" => "deepvibe"
    end
  end

  on_linux do
    on_intel do
      url "https://github.com/deepvibe-eu/DeepVibe/releases/download/v1.0.6/DeepVibe-1.0.6-linux-x86_64.AppImage"
      sha256 "6fe1153076ee3e252aa425b207a7b08f8dc85487ef22ec07acbf559fd31e6bda"
    end

    def install
      bin.install "DeepVibe-1.0.6-linux-x86_64.AppImage" => "deepvibe"
    end
  end
end
