# ISL Translation - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Run the Application
```bash
npm run dev
```

### Step 2: Open Browser
Navigate to `http://localhost:5173/translate`

### Step 3: Start Translating
1. Click the **camera icon** 📹 to enable webcam
2. Click **"Start Translation"** button
3. Show hand gestures to camera
4. See instant translation with audio!

## 🤚 Supported Hand Gestures

### Numbers
| Gesture | Description |
|---------|-------------|
| ☝️ | **One** - Index finger up |
| ✌️ | **Two** - Index + middle fingers |
| 🤟 | **Three** - Index + middle + ring fingers |
| 🖖 | **Four** - All fingers except thumb |
| 🖐️ | **Five** - All fingers extended |

### Common Signs
| Gesture | Meaning |
|---------|---------|
| 👋 | **Hello** - Open palm |
| 👍 | **Good/Yes** - Thumbs up |
| ✊ | **Stop** - Closed fist |
| 👌 | **OK** - Thumb and index touching |
| ☮️ | **Peace** - V sign |
| 👉 | **Point** - Index finger extended |

## 🌐 Supported Languages

- 🇬🇧 **English**
- 🇮🇳 **Hindi** (हिंदी)
- 🇮🇳 **Bengali** (বাংলা)
- 🇮🇳 **Tamil** (தமிழ்)
- 🇮🇳 **Telugu** (తెలుగు)
- 🇮🇳 **Marathi** (मराठी)

## 💡 Tips for Best Results

### Camera Setup
- ✅ **Good lighting** - Face a light source
- ✅ **Clear background** - Avoid clutter
- ✅ **Stable position** - Keep camera steady
- ✅ **Distance** - Keep hand 1-2 feet from camera

### Hand Position
- ✅ **Show full hand** - All fingers visible
- ✅ **Palm facing camera** - Clear view
- ✅ **Steady gesture** - Hold for 1-2 seconds
- ✅ **One gesture at a time** - Clear transitions

### Audio
- 🔊 **Enable audio** - Click speaker icon
- 🔇 **Disable if needed** - Click speaker icon again
- ▶️ **Manual playback** - Click "Play Audio" button
- 🔄 **Change language** - Select from dropdown

## 🎯 Common Issues & Solutions

### "Camera not working"
→ Allow camera permission in browser settings

### "Hand not detected"
→ Improve lighting and show full hand clearly

### "No audio"
→ Check browser volume and audio toggle

### "Low accuracy"
→ Hold gesture steady for 1-2 seconds

## 📊 Understanding the Interface

### Video Feed
- **Green lines** = Hand skeleton detected
- **Red dots** = Hand landmarks (joints)
- Real-time visual feedback

### Translation Output
- **Detected Sign** = Recognized gesture
- **Translation** = Text in target language
- **Confidence** = Recognition accuracy %

### Stats Panel
- **Status** = Active/Idle
- **Avg Latency** = Processing speed
- **Accuracy** = Detection confidence
- **Signs Detected** = Total count
- **Translations** = Successful conversions

### Recent Translations
- Shows last 5 translations
- Displays gesture + translation
- Confidence score badge
- Click "Clear" to reset

## 🎮 Controls

| Icon | Action | Function |
|------|--------|----------|
| 📹 | Camera | Toggle webcam on/off |
| 🔊 | Audio | Enable/disable sound |
| ▶️ | Start/Stop | Begin/end translation |
| 🔄 | Reset | Clear statistics |
| 🗑️ | Clear | Clear history |

## 🔥 Pro Tips

1. **Practice common gestures** - Start with numbers 1-5
2. **Use good lighting** - Natural light works best
3. **Hold gestures steady** - 1-2 seconds for stability
4. **Check confidence score** - Aim for >80%
5. **Try different languages** - Test multilingual support

## 🌟 Example Session

```
1. Enable camera 📹
2. Click "Start Translation"
3. Show "thumbs up" 👍
4. See: "Good / Yes" → "अच्छा / हाँ" (Hindi)
5. Hear audio: "Accha / Haan"
6. Show "peace sign" ✌️
7. See: "Peace / Victory" → "शांति / विजय"
8. Check stats: 2 signs detected, 95% accuracy
```

## 🆘 Need Help?

1. **Check ISL_FEATURES.md** - Full documentation
2. **Browser console** - Look for error messages
3. **Test in Chrome/Edge** - Best MediaPipe support
4. **Clear cache** - If models fail to load

## 🎓 Learning Resources

### ISL Basics
- Practice common signs first
- Focus on clear hand positions
- Build muscle memory
- Gradual complexity increase

### App Features
- Explore language options
- Monitor accuracy metrics
- Review translation history
- Experiment with settings

---

**Ready to bridge the communication gap? Let's go! 🌉**
