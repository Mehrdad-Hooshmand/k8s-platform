#!/bin/bash

echo "🔧 APK Installer - Fixed Version"
echo "================================="

# Set environment variables
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=/opt/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator

# Use a working AVD name
AVD_NAME="TestDevice"

echo "🔍 Checking for existing system images..."
AVAILABLE_IMAGES=$(sdkmanager --list_installed | grep "system-images" | head -1)

if [ -z "$AVAILABLE_IMAGES" ]; then
    echo "❌ No system images found!"
    echo "📦 Installing Android 29 system image (this will take time)..."
    sdkmanager "system-images;android-29;default;x86_64"
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install system image"
        exit 1
    fi
fi

echo "🚀 Creating Android Virtual Device..."

# Delete existing AVD if exists
avdmanager delete avd -n $AVD_NAME 2>/dev/null

# Create new AVD
echo "no" | avdmanager create avd \
    --name $AVD_NAME \
    --package "system-images;android-29;default;x86_64" \
    --force

if [ $? -eq 0 ]; then
    echo "✅ AVD '$AVD_NAME' created successfully!"
    
    echo ""
    echo "Choose what to do:"
    echo "1) Start emulator with GUI"
    echo "2) Install F-Droid (background mode)"  
    echo "3) Install APK file (background mode)"
    echo ""
    read -p "Enter choice (1-3): " choice
    
    case $choice in
        1)
            echo "🎯 Starting Android emulator with GUI..."
            emulator -avd $AVD_NAME -gpu host
            ;;
        2)
            echo "🚀 Starting emulator in background..."
            emulator -avd $AVD_NAME -no-audio -no-window &
            
            echo "⏳ Waiting for emulator to boot (60 seconds)..."
            sleep 60
            
            echo "📦 Installing F-Droid..."
            wget -q -O /tmp/fdroid.apk https://f-droid.org/F-Droid.apk
            adb install /tmp/fdroid.apk
            
            echo "✅ F-Droid installed! You can now start the emulator GUI to see it."
            echo "Run: emulator -avd $AVD_NAME -gpu host"
            ;;
        3)
            read -p "Enter full path to APK file: " apk_file
            if [ -f "$apk_file" ]; then
                echo "🚀 Starting emulator in background..."
                emulator -avd $AVD_NAME -no-audio -no-window &
                
                echo "⏳ Waiting for emulator to boot..."
                sleep 60
                
                echo "📦 Installing APK: $apk_file"
                adb install "$apk_file"
                echo "✅ APK installed!"
            else
                echo "❌ APK file not found: $apk_file"
            fi
            ;;
        *)
            echo "❌ Invalid choice"
            ;;
    esac
    
else
    echo "❌ Failed to create AVD"
    echo "Available system images:"
    sdkmanager --list_installed | grep system-images
fi