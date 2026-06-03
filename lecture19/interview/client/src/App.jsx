// App.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import './App.css';

export default function App() {
  const [stage, setStage] = useState("intro");
  const [code, setCode] = useState("// Write your FizzBuzz code here\nfor (let i = 1; i <= 100; i++) {\n  if (i % 15 === 0) console.log('FizzBuzz');\n  else if (i % 3 === 0) console.log('Fizz');\n  else if (i % 5 === 0) console.log('Buzz');\n  else console.log(i);\n}");
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReview = async () => {
    setLoading(true);
    setScore(null);
    setFeedback("");
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      setScore(data.score);
      setFeedback(data.feedback);
    } catch (err) {
      setFeedback("There was an error processing your submission.");
    } finally {
      setLoading(false);
    }
  };

  const introStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center'
  };

  const titleStyle = {
    fontSize: '4rem',
    fontWeight: 'bold',
    marginBottom: '3rem'
  };

  const buttonStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    backgroundColor: 'green',
    color: 'white',
    padding: '1rem 3rem',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer'
  };

  const containerStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '3rem 1rem'
  };

  const editorWrapperStyle = {
    height: '300px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginBottom: '1rem'
  };

  const reviewSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  };

  const reviewButtonStyle = {
    fontSize: '1rem',
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '0.5rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  const feedbackContainerStyle = {
    marginTop: '2rem'
  };

  const feedbackBoxStyle = {
    padding: '1rem',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
    whiteSpace: 'pre-wrap',
    color: '#333'
  };

  return (
      <div style={{ backgroundColor: 'white', width: '100%', height: '100%', overflowX: 'hidden', overflowY: 'auto' }}>
      {stage === "intro" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={introStyle}>
          <h1 style={titleStyle}>INTERVIEW PREP</h1>
          <button style={buttonStyle} onClick={() => setStage("fizzbuzz")}>Start</button>
        </motion.div>
      )}

      {stage === "fizzbuzz" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={containerStyle}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>FizzBuzz Challenge</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Write a program that prints the numbers from 1 to 100. But for multiples of three, print "Fizz" instead of the number and for the multiples of five, print "Buzz". For numbers which are multiples of both three and five, print "FizzBuzz".
          </p>
          <div style={editorWrapperStyle}>
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{ fontSize: 14, minimap: { enabled: false } }}
            />
          </div>
          <div style={reviewSectionStyle}>
            <button style={reviewButtonStyle} onClick={handleReview} disabled={loading}>Review</button>
            {loading && <div className="spinner" />}
          </div>

          {!loading && score !== null && (
            <div style={feedbackContainerStyle}>
              <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Score: {score}/10</h3>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Feedback:</div>
              <div style={feedbackBoxStyle}>{feedback}</div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

