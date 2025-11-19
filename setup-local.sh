#!/bin/bash

echo "🚀 Setting up Drone Harmony local environment..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "📦 Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install FFmpeg
echo "🎥 Installing FFmpeg..."
brew install ffmpeg

# Check if nvm is installed
if ! command -v nvm &> /dev/null; then
    echo "📦 Installing nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    
    # Load nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Install Node 18
echo "📦 Installing Node.js 18..."
nvm install 18
nvm use 18

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

echo "✅ Setup complete! Run 'npm run dev' to start the app."
