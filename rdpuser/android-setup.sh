#!/bin/bash

# Android Setup Script
# This script sets up Android environment and creates AVD

echo "🔧 Setting up Android Environment..."

# Set environment variables
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=/opt/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator

echo "📋 Environment variables set:"
echo "JAVA_HOME: $JAVA_HOME"
echo "ANDROID_HOME: $ANDROID_HOME"
echo "PATH updated with Android tools"

# Check if system image exists
echo "🔍 Checking for system images..."
if [ ! -d "$ANDROID_HOME/system-images/android-30/google_apis/x86_64" ]; then
    echo "📦 Downloading Android 30 system image (x86_64)..."
    sdkmanager "system-images;android-30;google_apis;x86_64"
    if [ $? -ne 0 ]; then
        echo "❌ Failed to download system image"
        exit 1
    fi
else
    echo "✅ System image already exists"
fi

# Create AVD if it doesn't exist
echo "🚀 Creating Android Virtual Device..."
AVD_NAME="MyAndroid"

# Delete existing AVD if it exists
if [ -f "$HOME/.android/avd/${AVD_NAME}.avd/config.ini" ]; then
    echo "🗑️ Removing existing AVD..."
    avdmanager delete avd -n $AVD_NAME 2>/dev/null
fi

# Create new AVD
echo "✨ Creating new AVD: $AVD_NAME"
echo "no" | avdmanager create avd \
    --name $AVD_NAME \
    --package "system-images;android-30;google_apis;x86_64" \
    --device "pixel" \
    --force

if [ $? -eq 0 ]; then
    echo "✅ AVD created successfully!"
    echo "🎯 You can now use the AVD with name: $AVD_NAME"
else
    echo "❌ Failed to create AVD"
    exit 1
fi

# List available AVDs
echo "📱 Available AVDs:"
avdmanager list avd

echo ""
echo "🎉 Android setup complete!"
echo "You can now run the emulator with:"
echo "emulator -avd $AVD_NAME -gpu host"