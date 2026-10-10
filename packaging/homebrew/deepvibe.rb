# Homebrew formula for DeepVibe.
#
# Lives in a tap repository named e.g. `deepvibe-eu/homebrew-tap`, at
# `Formula/deepvibe.rb`. Users then run:
#
#   brew tap deepvibe-eu/tap
#   brew install deepvibe
#
# Both macOS (arm64) and Linux (AppImage) are served from the same formula,
# selected automatically via on_macos/on_linux.
#
# NOTE: the macOS build is currently unsigned/unnotarized. On macOS the app
# will be quarantined by Gatekeeper; sign + notarize the release before
# promoting this heavily, or users must right-click -> Open once.
#
# Regenerate the hashes with packaging/homebrew/print-checksums.sh.
class Deepvibe < Formula
  desc "The (unofficial) DeepSeek coding partner IDE"
  homepage "https://github.com/deepvibe-eu/DeepVibe"
  version "1.0.2"

  on_macos do
    url "https://github.com/deepvibe-eu/DeepVibe/releases/download/v#{version}/DeepVibe-#{version}-mac-arm64.zip"
    sha256 "439399dcec80b2a561eb1cfb0a0c899dfdb6caaa1ce22f720d02ca51e3f2a4f4"

    def install
      prefix.install "DeepVibe.app"
      bin.write_exec_script "#{prefix}/DeepVibe.app/Contents/MacOS/DeepVibe"
    end
  end

  on_linux do
    url "https://github.com/deepvibe-eu/DeepVibe/releases/download/v#{version}/DeepVibe-#{version}-linux-x86_64.AppImage"
    sha256 "dbb13c8193890b7db57628c800c7f91794c41aefdb46e4fd69e254b4c3e2fd34"

    def install
      bin.install "DeepVibe-#{version}-linux-x86_64.AppImage" => "deepvibe"
    end
  end
end
