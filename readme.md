# AI Proctoring System with MediaPipe Holistic

A comprehensive AI-powered proctoring system that uses MediaPipe Holistic to detect suspicious behaviors during online exams in real-time.

[Video Demo](https://youtu.be/6_3ONmWvKYA) | [Live Demo](https://www.funwithcomputervision.com/demo1/)

<img src="demo.png">

## Features

### Real-time Behavior Detection
The system monitors and detects 10 different suspicious behaviors:

1. **Pre-answering before exam starts** - Detects writing gestures before exam begins
2. **Head tilts (left/right/backward)** - Monitors unusual head movements
3. **Candidate standing up** - Detects when student leaves seated position
4. **Passing or picking up objects** - Identifies hand movements beyond normal range
5. **Carrying or hiding suspicious objects** - Detects concealed items or unusual hand positions
6. **Hands under table + looking down** - Monitors hands below desk level
7. **Entering/leaving room** - Detects movement toward frame edges
8. **Raising hand (half/full)** - Identifies hand-raising gestures
9. **Smartphone usage detection** - Detects phone holding and interaction patterns
10. **Writing after exam ends** - Monitors continued writing after exam completion

### Technical Features
- **MediaPipe Holistic** for comprehensive pose, face, and hand tracking
- **Real-time processing** with 30fps+ performance
- **Visual overlays** showing detected behaviors on screen
- **JSON logging** with timestamps and confidence scores
- **Exam session management** with start/end controls
- **Responsive design** that adapts to different screen sizes

## Setup for Development

```bash
# Navigate to the project directory
cd hand-tracking-101

# Serve with your preferred method (example using Python)
python -m http.server

# Use your browser and go to:
http://localhost:8000
```

## Usage

### Controls
- **Press "S"** - Start exam session
- **Press "E"** - End exam session
- **Automatic monitoring** - System continuously monitors for suspicious behaviors

### Behavior Detection
Each detected behavior triggers:
- Visual alert overlay on screen
- Console log with JSON-formatted data
- Status message update
- 2-second cooldown to prevent spam

### Console Logging
All detections are logged to browser console in JSON format:
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "behavior": "head_tilt_detected",
  "confidence": 1.0,
  "examActive": true,
  "examTime": 125.5
}
```

## Requirements

- Modern web browser with WebGL support
- Camera access
- JavaScript enabled
- Stable internet connection for MediaPipe libraries

## Technologies

- **MediaPipe Holistic** - Full-body pose, face, and hand tracking
- **HTML5 Canvas** - Real-time visual overlays and landmark rendering
- **JavaScript ES6+** - Modern async/await patterns and real-time processing
- **CSS3** - Responsive design and visual styling

## Architecture

### Core Components
1. **MediaPipe Holistic Integration** - Handles pose, face, and hand landmark detection
2. **Behavior Detection Engine** - Rule-based classification of suspicious activities
3. **Visual Rendering System** - Draws landmarks and behavior alerts on canvas
4. **Logging System** - JSON-formatted event logging with timestamps
5. **Exam Session Management** - Controls exam start/end states

### Detection Algorithms
- **Angle Calculations** - Computes joint angles for pose analysis
- **Distance Measurements** - Analyzes spatial relationships between landmarks
- **Temporal Analysis** - Uses pose history for movement pattern recognition
- **Threshold-based Classification** - Configurable sensitivity levels for each behavior

## Customization

### Adjusting Detection Sensitivity
Modify the detection thresholds in `main.js`:
```javascript
// Example: Adjust head tilt sensitivity
const headTiltThreshold = 15; // degrees

// Example: Adjust detection cooldown
const detectionCooldown = 2000; // milliseconds
```

### Adding New Behaviors
1. Create detection function in `main.js`
2. Add to `detectedBehaviors` object
3. Integrate into `onResults()` function
4. Add visual rendering in `drawBehaviorAlerts()`

## Performance Optimization

- **Landmark filtering** - Only processes visible landmarks (visibility > 0.5)
- **Frame rate optimization** - Efficient canvas rendering
- **Memory management** - Limited pose history storage
- **Cooldown system** - Prevents excessive logging

## Browser Compatibility

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## License

MIT License

## Development History

This project evolved from a simple hand tracking demo to a comprehensive proctoring system:

1. **Initial Setup** - Basic MediaPipe Hands integration
2. **Three.js Integration** - Added 3D sphere interaction
3. **Holistic Migration** - Upgraded to full-body tracking
4. **Behavior Detection** - Implemented 10 suspicious behavior classifiers
5. **Proctoring Features** - Added exam session management and logging

## Future Enhancements

- Machine learning-based behavior classification
- Multi-camera support
- Audio analysis integration
- Cloud-based logging and analytics
- Mobile device support
- Advanced gesture recognition
- Real-time alert notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
- Check the browser console for error messages
- Ensure camera permissions are granted
- Verify internet connection for MediaPipe libraries
- Test with different browsers if issues persist