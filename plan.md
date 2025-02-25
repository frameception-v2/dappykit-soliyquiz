### Step 1: Implement Start Frame 
```text
- Build: Basic HTML frame with header and "Begin Quiz" button that sends POST to /api/quiz?init=true
- Outcome: Verify button exists and clicking it triggers API call (check browser devtools network tab)
```

### Step 2: Create Quiz Initialization Endpoint 
```text
- Build: POST /api/quiz handler for init=true that creates new QuizState and returns first question
- Outcome: Test with curl -X POST "API_URL?init=true" returns valid HTML with question 1
```

### Step 3: Render First Question 
```text
- Build: Question frame template with dynamic text/options from SOLIDITY_QUESTIONS[0]
- Outcome: API response shows complete first question with 4 answer buttons and hidden state fields
```

### Step 4: Implement Answer Validation 
```text
- Build: API logic to check submitted answer against correctIndex, calculate score delta
- Outcome: Submit correct/incorrect answers via POST and verify feedback shows ✔️/❌ appropriately
```

### Step 5: Add State Encoding 
```text
- Build: Base64 URL parameter encoding for QuizState (currentQuestion + score)
- Outcome: Verify subsequent API requests include valid state parameter in POST body
```

### Step 6: Handle Invalid State Fallback 
```text
- Build: Error handler for malformed/missing state that resets quiz with warning message
- Outcome: Test with corrupted state parameter shows "Invalid session" message and restart button
```

### Step 7: Implement Question Progression 
```text
- Build: Next Question button handling that increments currentQuestion in state
- Outcome: Completing Q1 shows Q2, maintains score through multiple questions
```

### Step 8: Create Results Frame 
```text
- Build: Final score display after last question with percentage calculation
- Outcome: Completing all questions shows "Your Score: X/10" and share button
```

### Step 9: Add Social Features 
```text
- Build: Share-to-recast button with encoded results and try-again functionality
- Outcome: Share button generates valid cast URL, try-again resets quiz state
```

### Step 10: Implement Signature Validation 
```text
- Build: @farcaster/hub-web authentication middleware for API endpoints
- Outcome: Unsigned requests return 401, valid requests with signatures are processed
```