# 🔬 Gesture Testing Guide

## ✅ Testing Your Custom Gestures

Use this guide to test the gestures you train using the camera-based Training Mode.

---

## 📋 Your Custom Gestures

<!-- Add your custom gesture definitions here as you train them -->

**Example format:**
```
### ✋ [Gesture Name]
**How to show**: [Description of hand position]
**Key details**: [Important finger positions or angles]
**Samples trained**: [Number of samples you captured]
```

---

## 🧪 Testing Checklist

### For Each Gesture:
- [ ] Hold gesture for **at least 1 second** (stability requirement)
- [ ] Keep hand **steady** (no shaking)
- [ ] Ensure **good lighting** (camera can see hand clearly)
- [ ] Check **camera angle** (hand fully visible)
- [ ] **Background** is not too busy (plain wall works best)
- [ ] Verify subtitle appears **within 1-2 seconds**
- [ ] Check that gesture **name matches** what you're showing
- [ ] Voice should speak **only once** per gesture
- [ ] Try the gesture **3 times** to verify consistency

### Known Limitations:
1. **Gestures requiring movement** may not work well (static detection only)
2. **Very similar hand positions** may be confused
3. **Two-hand gestures** need both hands visible
4. **Lighting is critical** - poor lighting = poor detection
5. **Camera quality matters** - higher resolution = better accuracy
6. **Train 5-20 samples** per gesture for best results

---

## 🐛 Troubleshooting

### Problem: "Gesture not recognized"
**Causes**:
1. Poor lighting
2. Camera too far / hand too small
3. Fingers not fully extended/closed
4. Hand at wrong angle
5. Moving hand too fast

**Solutions**:
1. Move closer to camera
2. Use bright light source
3. **Exaggerate the gesture** (fully extend or close fingers)
4. Hold gesture completely still for 2 seconds
5. Try different camera angle

### Problem: "Voice repeating"
**Fix**: This is now fixed - voice should only speak once per gesture with 2-second cooldown

### Problem: "No subtitle appearing"
**Causes**:
1. Gesture not held long enough (need 800ms+)
2. Confidence too low (<70%)
3. Hand not visible to camera
4. Fingers in ambiguous position

**Solutions**:
1. Hold gesture for full 2 seconds
2. Make gesture clearer/stronger
3. Ensure hand is centered in camera view
4. Check webcam permissions in browser

---

## 📊 Expected Accuracy Rates

Add your custom accuracy expectations here after training your gestures.

---

## 🎓 Best Practices

### For Best Recognition:
1. ✅ **Use good lighting** (face a window or lamp)
2. ✅ **Keep hand centered** in camera view
3. ✅ **Hold still** for 1-2 seconds
4. ✅ **Make crisp movements** between gestures
5. ✅ **Fully extend/close fingers** - no half positions
6. ✅ **Practice in front of mirror** first to check form
7. ✅ **Start 1-2 feet from camera** (not too close/far)
8. ✅ **Use neutral background** (plain wall, not cluttered)
9. ✅ **Check webcam quality** - 720p minimum recommended

### Testing Sequence:
1. Train your custom gestures using Training Mode
2. Test each gesture 3 times for consistency
3. Check accuracy and confidence scores
4. Retrain if needed with more samples

---

## 📈 Training Features

### Camera-Based Training:
✅ **Live camera preview** - See yourself while training
✅ **Hand detection indicator** - Real-time feedback
✅ **3-second countdown** - Time to position your hand
✅ **Progress tracking** - Visual progress bar
✅ **Multiple samples** - Capture 5-20 samples per gesture
✅ **Custom gestures** - Train any gesture you want
✅ **Export/Import** - Share training data
✅ **Statistics** - Track your training progress

### Current System Stats:
- **Hold Time**: 800ms minimum
- **Stability Frames**: 8 frames required
- **Confidence Threshold**: 65% minimum
- **Speech Cooldown**: 2 seconds
- **Sample Range**: 5-20 per gesture

---

## 🆘 Getting Help

If gestures still don't work after following this guide:

1. **Check the console** (F12 in browser) for error messages
2. **Verify webcam permissions** are granted
3. **Try different lighting** (daylight vs artificial)
4. **Test with different hand** (left vs right)
5. **Restart the application** (refresh browser)
6. **Check camera quality** (try different camera if available)
7. **Use Training Mode** to add your custom gestures with camera

---

## ✨ Happy Testing!

The system now includes camera-based training! You can:
- **Train your own gestures** using the live camera
- **Capture multiple samples** for better accuracy
- **See real-time feedback** with hand detection
- **Export and share** your training data

Remember:
- **Hold gestures steady** for 1-2 seconds
- **Good lighting is critical**
- **Use Training Mode** to personalize recognition

Start training your custom gestures now!
