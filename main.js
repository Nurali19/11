document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const connectionScreen = document.getElementById('connection-screen');
    const monitoringScreen = document.getElementById('monitoring-screen');
    const phoneVideoElement = document.getElementById('phone-video');
    const canvasElement = document.getElementById('canvas');
    const canvasCtx = canvasElement.getContext('2d');
    const statusElement = document.getElementById('status');
    const qrCodeElement = document.getElementById('qr-code');
    const connectionStatusElement = document.getElementById('connection-status');
    const connectionUrlElement = document.getElementById('connection-url');
    const localIpElement = document.getElementById('local-ip');
    const connectionStatusTextElement = document.getElementById('connection-status-text');
    const manualUrlElement = document.getElementById('manual-url');
    
    // Connection variables
    let connectionUrl = null;
    let localIp = null;
    let isConnected = false;
    
    // Proctoring system variables
    let holistic;
    let examStartTime = null;
    let examEndTime = null;
    let isExamActive = false;
    let lastDetectionTime = {};
    const detectionCooldown = 2000;
    
    // Behavior detection state
    let detectedBehaviors = {
        preAnswering: false,
        headTilt: false,
        standingUp: false,
        passingObjects: false,
        suspiciousObjects: false,
        handsUnderTable: false,
        leavingRoom: false,
        raisingHand: false,
        smartphoneUsage: false,
        writingAfterExam: false
    };
    
    // Get local IP address
    async function getLocalIP() {
        try {
            // For local development, use the actual local network IP
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                // Return the local network IP for phone connections
                return '172.20.10.3';
            }
            
            // For GitHub Pages or other hosted sites, try to get the actual hostname
            if (window.location.hostname.includes('github.io') || window.location.hostname.includes('netlify.app') || window.location.hostname.includes('vercel.app')) {
                return window.location.hostname;
            }
            
            // Fallback to external IP service
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Error getting IP:', error);
            return window.location.hostname || 'localhost';
        }
    }
    
    // Generate connection URL
    function generateConnectionUrl() {
        const protocol = window.location.protocol;
        const host = window.location.host;
        
        // For local development, use the local network IP with port 8000
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return `${protocol}//172.20.10.3:8000/phone.html`;
        }
        
        return `${protocol}//${host}/phone.html`;
    }
    
    // Generate connection display (no external dependencies)
    function generateConnectionDisplay() {
        const url = connectionUrl;
        
        if (!url) {
            console.error('No connection URL available');
            updateConnectionStatus('Error: No connection URL', 'error');
            return;
        }
        
        // Clear previous content
        qrCodeElement.innerHTML = '';
        
        // Create a simple, reliable connection display
        qrCodeElement.innerHTML = `
            <div style="padding: 20px; text-align: center; border: 2px solid #007bff; border-radius: 10px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);">
                <div style="font-size: 48px; margin-bottom: 15px;">📱</div>
                <h3 style="color: #007bff; margin-bottom: 15px;">Phone Camera Connection</h3>
                <p style="margin-bottom: 20px; color: #6c757d;">Click the button below to open the phone connection page</p>
                
                <a href="${url}" target="_blank" style="display: inline-block; padding: 15px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 10px 0; box-shadow: 0 4px 6px rgba(0,123,255,0.3); transition: all 0.3s ease;">
                    🔗 Open Phone Connection
                </a>
                
                <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; border-left: 4px solid #28a745;">
                    <p style="margin: 0; font-size: 14px; color: #495057;"><strong>Instructions:</strong></p>
                    <ol style="margin: 10px 0 0 0; padding-left: 20px; text-align: left; font-size: 14px; color: #6c757d;">
                        <li>Click the button above</li>
                        <li>Allow camera access when prompted</li>
                        <li>Your phone camera will connect to this computer</li>
                        <li>Return here to see the monitoring screen</li>
                    </ol>
                </div>
                
                <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px;">
                    <p style="margin: 0; font-size: 12px; color: #856404; word-break: break-all; font-family: monospace;">
                        <strong>URL:</strong> ${url}
                    </p>
                </div>
            </div>
        `;
        
        updateConnectionStatus('Phone connection ready - click the button above', 'waiting');
    }
    
    // Update connection status
    function updateConnectionStatus(message, type = 'waiting') {
        const statusDot = connectionStatusElement.querySelector('.status-dot');
        const statusText = connectionStatusElement.querySelector('.status-text');
        
        statusText.textContent = message;
        statusDot.className = 'status-dot ' + type;
        connectionStatusTextElement.textContent = message;
    }
    
    // Copy URL to clipboard
    function copyUrl() {
        navigator.clipboard.writeText(connectionUrl).then(() => {
            alert('URL copied to clipboard!');
        }).catch(err => {
            console.error('Could not copy URL: ', err);
            // Fallback: select the text
            const range = document.createRange();
            range.selectNodeContents(manualUrlElement);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        });
    }
    
    // Make copyUrl function global
    window.copyUrl = copyUrl;
    
    // Canvas size management
    function updateCanvasSize() {
        canvasElement.width = window.innerWidth;
        canvasElement.height = window.innerHeight;
    }
    
    function initializeLayout() {
        updateCanvasSize();
    }
    
    window.addEventListener('resize', () => {
        initializeLayout();
    });
    
    // Simplified behavior detection functions
    function detectPreAnswering(poseLandmarks, handLandmarks) {
        if (!isExamActive && examStartTime === null && handLandmarks && handLandmarks.length > 0) {
            for (let hand of handLandmarks) {
                const indexTip = hand[8];
                const middleTip = hand[12];
                const indexExtended = indexTip.y < hand[6].y;
                const middleExtended = middleTip.y < hand[10].y;
                if (indexExtended && middleExtended) return true;
            }
        }
        return false;
    }
    
    function detectHeadTilt(poseLandmarks) {
        if (!poseLandmarks) return false;
        const nose = poseLandmarks[0];
        const leftEar = poseLandmarks[3];
        const rightEar = poseLandmarks[4];
        const angle = Math.abs(Math.atan2(leftEar.y - rightEar.y, leftEar.x - rightEar.x) * 180 / Math.PI);
        return angle > 15;
    }
    
    function detectStandingUp(poseLandmarks) {
        if (!poseLandmarks) return false;
        const leftHip = poseLandmarks[23];
        const rightHip = poseLandmarks[24];
        const leftKnee = poseLandmarks[25];
        const rightKnee = poseLandmarks[26];
        const avgHipY = (leftHip.y + rightHip.y) / 2;
        const avgKneeY = (leftKnee.y + rightKnee.y) / 2;
        return (avgHipY - avgKneeY) > 0.1;
    }
    
    function detectPassingObjects(poseLandmarks, handLandmarks) {
        if (!poseLandmarks || !handLandmarks) return false;
        const leftShoulder = poseLandmarks[11];
        const rightShoulder = poseLandmarks[12];
        for (let hand of handLandmarks) {
            const wrist = hand[0];
            const handExtended = Math.abs(wrist.x - leftShoulder.x) > 0.3 || 
                                Math.abs(wrist.x - rightShoulder.x) > 0.3;
            if (handExtended) return true;
        }
        return false;
    }
    
    function detectSuspiciousObjects(poseLandmarks, handLandmarks) {
        if (!poseLandmarks || !handLandmarks) return false;
        const leftShoulder = poseLandmarks[11];
        for (let hand of handLandmarks) {
            const wrist = hand[0];
            const indexTip = hand[8];
            const middleTip = hand[12];
            const handClosed = indexTip.y > hand[6].y && middleTip.y > hand[10].y;
            const handHidden = wrist.y > leftShoulder.y && Math.abs(wrist.x - leftShoulder.x) < 0.2;
            if (handClosed && handHidden) return true;
        }
        return false;
    }
    
    function detectHandsUnderTable(poseLandmarks, handLandmarks) {
        if (!poseLandmarks || !handLandmarks) return false;
        const leftHip = poseLandmarks[23];
        const rightHip = poseLandmarks[24];
        const avgHipY = (leftHip.y + rightHip.y) / 2;
        for (let hand of handLandmarks) {
            const wrist = hand[0];
            if (wrist.y > avgHipY + 0.1) return true;
        }
        return false;
    }
    
    function detectLeavingRoom(poseLandmarks) {
        if (!poseLandmarks) return false;
        const nose = poseLandmarks[0];
        const leftShoulder = poseLandmarks[11];
        const rightShoulder = poseLandmarks[12];
        const avgShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
        return avgShoulderX < 0.1 || avgShoulderX > 0.9 || nose.x < 0.05 || nose.x > 0.95;
    }
    
    function detectRaisingHand(poseLandmarks, handLandmarks) {
        if (!poseLandmarks || !handLandmarks) return false;
        const leftShoulder = poseLandmarks[11];
        for (let hand of handLandmarks) {
            const wrist = hand[0];
            if (wrist.y < leftShoulder.y - 0.1) return true;
        }
        return false;
    }
    
    function detectSmartphoneUsage(poseLandmarks, handLandmarks) {
        if (!poseLandmarks || !handLandmarks) return false;
        const leftShoulder = poseLandmarks[11];
        const nose = poseLandmarks[0];
        for (let hand of handLandmarks) {
            const wrist = hand[0];
            const thumbTip = hand[4];
            const indexTip = hand[8];
            const handInFront = wrist.z < leftShoulder.z;
            const handAtChestLevel = wrist.y > leftShoulder.y - 0.2 && wrist.y < leftShoulder.y + 0.3;
            const handInRange = Math.abs(wrist.x - leftShoulder.x) < 0.4;
            const thumbExtended = thumbTip.y < hand[3].y;
            const indexExtended = indexTip.y < hand[6].y;
            const headTiltDown = nose.y > leftShoulder.y + 0.1;
            const sustainedPosition = handInFront && handAtChestLevel && handInRange;
            const smartphoneGesture = thumbExtended && indexExtended;
            if (sustainedPosition && smartphoneGesture && headTiltDown) return true;
        }
        return false;
    }
    
    function detectWritingAfterExam(poseLandmarks, handLandmarks) {
        if (!isExamActive && examEndTime !== null && handLandmarks && handLandmarks.length > 0) {
            for (let hand of handLandmarks) {
                const indexTip = hand[8];
                const middleTip = hand[12];
                const indexExtended = indexTip.y < hand[6].y;
                const middleExtended = middleTip.y < hand[10].y;
                if (indexExtended && middleExtended) return true;
            }
        }
        return false;
    }
    
    // Logging function
    function logBehavior(behavior, confidence = 1.0) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp: timestamp,
            behavior: behavior,
            confidence: confidence,
            examActive: isExamActive,
            examTime: examStartTime ? (Date.now() - examStartTime) / 1000 : 0
        };
        
        console.log('PROCTORING_ALERT:', JSON.stringify(logEntry));
        statusElement.textContent = `Alert: ${behavior}`;
        setTimeout(() => {
            statusElement.textContent = 'Monitoring...';
        }, 3000);
    }
    
    // Drawing functions
    function drawPoseLandmarks(poseLandmarks) {
        if (!poseLandmarks) return;
        
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], [9, 10],
            [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24]
        ];
        
        canvasCtx.strokeStyle = '#00FF00';
        canvasCtx.lineWidth = 2;
        
        connections.forEach(([i, j]) => {
            const start = poseLandmarks[i];
            const end = poseLandmarks[j];
            if (start && end && start.visibility > 0.5 && end.visibility > 0.5) {
                canvasCtx.beginPath();
                canvasCtx.moveTo(start.x * canvasElement.width, start.y * canvasElement.height);
                canvasCtx.lineTo(end.x * canvasElement.width, end.y * canvasElement.height);
                canvasCtx.stroke();
            }
        });
        
        poseLandmarks.forEach((landmark, index) => {
            if (landmark.visibility > 0.5) {
                canvasCtx.fillStyle = '#FF0000';
                canvasCtx.beginPath();
                canvasCtx.arc(
                    landmark.x * canvasElement.width,
                    landmark.y * canvasElement.height,
                    3,
                    0,
                    2 * Math.PI
                );
                canvasCtx.fill();
            }
        });
    }
    
    function drawHandLandmarks(handLandmarks) {
        if (!handLandmarks) return;
        
        handLandmarks.forEach((hand, handIndex) => {
            const connections = [
                [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8],
                [0, 9], [9, 10], [10, 11], [11, 12], [0, 13], [13, 14], [14, 15], [15, 16],
                [0, 17], [17, 18], [18, 19], [19, 20]
            ];
            
            const handColor = handIndex === 0 ? '#00FF00' : '#00FFFF';
            
            canvasCtx.strokeStyle = handColor;
            canvasCtx.lineWidth = 2;
            
            connections.forEach(([i, j]) => {
                const start = hand[i];
                const end = hand[j];
                if (start && end && start.visibility > 0.5 && end.visibility > 0.5) {
                    canvasCtx.beginPath();
                    canvasCtx.moveTo(start.x * canvasElement.width, start.y * canvasElement.height);
                    canvasCtx.lineTo(end.x * canvasElement.width, end.y * canvasElement.height);
                    canvasCtx.stroke();
                }
            });
            
            hand.forEach((landmark, index) => {
                if (landmark.visibility > 0.5) {
                    let pointColor = handColor;
                    if (index === 4 || index === 8) pointColor = '#FF0000';
                    else if (index === 0) pointColor = '#FFFF00';
                    
                    canvasCtx.fillStyle = pointColor;
                    canvasCtx.beginPath();
                    canvasCtx.arc(
                        landmark.x * canvasElement.width,
                        landmark.y * canvasElement.height,
                        2,
                        0,
                        2 * Math.PI
                    );
                    canvasCtx.fill();
                }
            });
        });
    }
    
    function drawBehaviorAlerts() {
        let yOffset = 50;
        Object.entries(detectedBehaviors).forEach(([behavior, isDetected]) => {
            if (isDetected) {
                canvasCtx.fillStyle = 'rgba(255, 0, 0, 0.8)';
                canvasCtx.fillRect(10, yOffset, 200, 25);
                canvasCtx.fillStyle = '#FFFFFF';
                canvasCtx.font = '14px Arial';
                canvasCtx.fillText(behavior, 15, yOffset + 17);
                yOffset += 30;
            }
        });
    }
    
    // Initialize MediaPipe Holistic
    async function initMediaPipeHolistic() {
        statusElement.textContent = 'Initializing MediaPipe Holistic...';
        
        holistic = new Holistic({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
            }
        });
        
        holistic.setOptions({
            modelComplexity: 2,
            smoothLandmarks: true,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7,
            refineFaceLandmarks: true,
            refineHandLandmarks: true
        });
        
        await holistic.initialize();
        statusElement.textContent = 'Proctoring system ready!';
        return holistic;
    }
    
    // Process results and detect behaviors
    function onResults(results) {
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        
        const poseLandmarks = results.poseLandmarks;
        const leftHandLandmarks = results.leftHandLandmarks;
        const rightHandLandmarks = results.rightHandLandmarks;
        const handLandmarks = [];
        
        if (leftHandLandmarks) handLandmarks.push(leftHandLandmarks);
        if (rightHandLandmarks) handLandmarks.push(rightHandmarks);
        
        drawPoseLandmarks(poseLandmarks);
        drawHandLandmarks(handLandmarks);
        
        const currentTime = Date.now();
        
        // Detect behaviors
        if (detectPreAnswering(poseLandmarks, handLandmarks)) {
            if (!detectedBehaviors.preAnswering && 
                (!lastDetectionTime.preAnswering || currentTime - lastDetectionTime.preAnswering > detectionCooldown)) {
                detectedBehaviors.preAnswering = true;
                lastDetectionTime.preAnswering = currentTime;
                logBehavior('pre_answering_before_exam_starts');
            }
        } else {
            detectedBehaviors.preAnswering = false;
        }
        
        if (detectHeadTilt(poseLandmarks)) {
            if (!detectedBehaviors.headTilt && 
                (!lastDetectionTime.headTilt || currentTime - lastDetectionTime.headTilt > detectionCooldown)) {
                detectedBehaviors.headTilt = true;
                lastDetectionTime.headTilt = currentTime;
                logBehavior('head_tilt_detected');
            }
        } else {
            detectedBehaviors.headTilt = false;
        }
        
        if (detectStandingUp(poseLandmarks)) {
            if (!detectedBehaviors.standingUp && 
                (!lastDetectionTime.standingUp || currentTime - lastDetectionTime.standingUp > detectionCooldown)) {
                detectedBehaviors.standingUp = true;
                lastDetectionTime.standingUp = currentTime;
                logBehavior('candidate_standing_up');
            }
        } else {
            detectedBehaviors.standingUp = false;
        }
        
        if (detectPassingObjects(poseLandmarks, handLandmarks)) {
            if (!detectedBehaviors.passingObjects && 
                (!lastDetectionTime.passingObjects || currentTime - lastDetectionTime.passingObjects > detectionCooldown)) {
                detectedBehaviors.passingObjects = true;
                lastDetectionTime.passingObjects = currentTime;
                logBehavior('passing_or_picking_up_objects');
            }
        } else {
            detectedBehaviors.passingObjects = false;
        }
        
        if (detectSuspiciousObjects(poseLandmarks, handLandmarks)) {
            if (!detectedBehaviors.suspiciousObjects && 
                (!lastDetectionTime.suspiciousObjects || currentTime - lastDetectionTime.suspiciousObjects > detectionCooldown)) {
                detectedBehaviors.suspiciousObjects = true;
                lastDetectionTime.suspiciousObjects = currentTime;
                logBehavior('carrying_or_hiding_suspicious_objects');
            }
        } else {
            detectedBehaviors.suspiciousObjects = false;
        }
        
        if (detectHandsUnderTable(poseLandmarks, handLandmarks)) {
            if (!detectedBehaviors.handsUnderTable && 
                (!lastDetectionTime.handsUnderTable || currentTime - lastDetectionTime.handsUnderTable > detectionCooldown)) {
                detectedBehaviors.handsUnderTable = true;
                lastDetectionTime.handsUnderTable = currentTime;
                logBehavior('hands_under_table_looking_down');
            }
        } else {
            detectedBehaviors.handsUnderTable = false;
        }
        
        if (detectLeavingRoom(poseLandmarks)) {
            if (!detectedBehaviors.leavingRoom && 
                (!lastDetectionTime.leavingRoom || currentTime - lastDetectionTime.leavingRoom > detectionCooldown)) {
                detectedBehaviors.leavingRoom = true;
                lastDetectionTime.leavingRoom = currentTime;
                logBehavior('entering_leaving_room');
            }
        } else {
            detectedBehaviors.leavingRoom = false;
        }
        
        if (detectRaisingHand(poseLandmarks, handLandmarks)) {
            if (!detectedBehaviors.raisingHand && 
                (!lastDetectionTime.raisingHand || currentTime - lastDetectionTime.raisingHand > detectionCooldown)) {
                detectedBehaviors.raisingHand = true;
                lastDetectionTime.raisingHand = currentTime;
                logBehavior('raising_hand');
            }
        } else {
            detectedBehaviors.raisingHand = false;
        }
        
        if (detectSmartphoneUsage(poseLandmarks, handLandmarks)) {
            if (!detectedBehaviors.smartphoneUsage && 
                (!lastDetectionTime.smartphoneUsage || currentTime - lastDetectionTime.smartphoneUsage > detectionCooldown)) {
                detectedBehaviors.smartphoneUsage = true;
                lastDetectionTime.smartphoneUsage = currentTime;
                logBehavior('smartphone_usage_detected');
            }
        } else {
            detectedBehaviors.smartphoneUsage = false;
        }
        
        if (detectWritingAfterExam(poseLandmarks, handLandmarks)) {
            if (!detectedBehaviors.writingAfterExam && 
                (!lastDetectionTime.writingAfterExam || currentTime - lastDetectionTime.writingAfterExam > detectionCooldown)) {
                detectedBehaviors.writingAfterExam = true;
                lastDetectionTime.writingAfterExam = currentTime;
                logBehavior('writing_after_exam_ends');
            }
        } else {
            detectedBehaviors.writingAfterExam = false;
        }
        
        drawBehaviorAlerts();
    }
    
    // Initialize proctoring system
    async function initializeProctoringSystem() {
        try {
            initializeLayout();
            const holistic = await initMediaPipeHolistic();
            
            holistic.onResults(onResults);
            
            // For now, we'll use a placeholder video or webcam
            // In a real implementation, you'd need to set up proper video streaming
            statusElement.textContent = 'Phone camera connection ready - Use phone.html for camera access';
            
        } catch (error) {
            statusElement.textContent = `Error: ${error.message}`;
            console.error('Error initializing proctoring system:', error);
        }
    }
    
    // Exam control functions
    function startExam() {
        examStartTime = Date.now();
        isExamActive = true;
        examEndTime = null;
        console.log('EXAM_STARTED:', JSON.stringify({
            timestamp: new Date().toISOString(),
            examStartTime: examStartTime
        }));
        statusElement.textContent = 'Exam started - Monitoring...';
    }
    
    function endExam() {
        examEndTime = Date.now();
        isExamActive = false;
        console.log('EXAM_ENDED:', JSON.stringify({
            timestamp: new Date().toISOString(),
            examEndTime: examEndTime,
            duration: (examEndTime - examStartTime) / 1000
        }));
        statusElement.textContent = 'Exam ended - Still monitoring...';
    }
    
    // Keyboard controls
    document.addEventListener('keydown', (event) => {
        switch(event.key) {
            case 's':
                startExam();
                break;
            case 'e':
                endExam();
                break;
        }
    });
    
    // Initialize connection system
    async function initializeConnection() {
        try {
            updateConnectionStatus('Initializing connection...', 'waiting');
            
            connectionUrl = generateConnectionUrl();
            console.log('Generated connection URL:', connectionUrl);
            
            localIp = await getLocalIP();
            console.log('Local IP:', localIp);
            
            connectionUrlElement.textContent = connectionUrl;
            localIpElement.textContent = localIp;
            manualUrlElement.textContent = connectionUrl;
            
            updateConnectionStatus('Generating connection display...', 'waiting');
            generateConnectionDisplay();
            
            updateConnectionStatus('Ready for phone connection', 'waiting');
            
            // Listen for phone connection status
            window.addEventListener('message', (event) => {
                if (event.data.type === 'phone_connection') {
                    if (event.data.status === 'connected') {
                        updateConnectionStatus('Phone camera connected', 'connected');
                        isConnected = true;
                    } else if (event.data.status === 'disconnected') {
                        updateConnectionStatus('Phone camera disconnected', 'error');
                        isConnected = false;
                    }
                }
            });
            
            // Check localStorage for phone status
            setInterval(() => {
                try {
                    const phoneStatus = localStorage.getItem('phone_camera_status');
                    if (phoneStatus) {
                        const status = JSON.parse(phoneStatus);
                        if (status.status === 'connected' && !isConnected) {
                            updateConnectionStatus('Phone camera connected', 'connected');
                            isConnected = true;
                        } else if (status.status === 'disconnected' && isConnected) {
                            updateConnectionStatus('Phone camera disconnected', 'error');
                            isConnected = false;
                        }
                    }
                } catch (error) {
                    console.log('Error checking phone status:', error);
                }
            }, 2000);
            
        } catch (error) {
            console.error('Error initializing connection:', error);
            updateConnectionStatus(`Error initializing connection: ${error.message}`, 'error');
            
            // Show fallback information
            connectionUrlElement.textContent = 'Error generating URL';
            localIpElement.textContent = 'Error getting IP';
            manualUrlElement.textContent = 'Please refresh the page';
        }
    }
    
    // Start the application
    initializeConnection();
});