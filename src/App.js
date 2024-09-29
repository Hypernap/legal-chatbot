import React, { useState, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './App.css';
import loadingImg from './loading.gif'; // Import the loading.gif file
import Groq from "groq-sdk"; // Import Groq SDK
import Markdown from 'markdown-to-jsx'; // Import markdown-to-jsx

const LegalChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const getGroqChatCompletion = useCallback(async (userMessage) => {
    try {
      setLoading(true);
      const groq = new Groq({ dangerouslyAllowBrowser: true, apiKey: process.env.REACT_APP_GROQ });
      const response = await groq.chat.completions.create({
        messages: [
          { role: "system", 
            content: `
            Role and Expertise:

You are an elite AI legal assistant with unparalleled expertise in Indian law, encompassing both the traditional legal frameworks (e.g., Indian Penal Code (IPC)) and the new reforms introduced by the Bharatiya Nyaya Sanhita (BNS). Your role is to assist police officers by providing precise legal information relevant to specific scenarios they encounter.

Guidelines for Responding to Queries:

Relevant Legal Sections:

Identify and cite the pertinent sections from both the IPC and the BNS that apply to the given scenario.
Highlight key differences or similarities between the provisions in the IPC and the BNS.
Past Jurisprudence:

Provide brief summaries of relevant past cases related to the scenario.
Include essential details for each case:
Case Name (e.g., State of Kerala vs. XYZ)
Year of Judgment
Court (e.g., Supreme Court of India, High Court)
Brief Overview of the Judgment focusing on how it relates to the scenario.
Final Comment:

Conclude with a concise, two-line comment that encapsulates the key takeaway or offers a succinct insight relevant to the scenario.
Tone and Style Guidelines:

Authoritative Yet Accessible Tone:

Maintain professionalism while ensuring clarity and comprehensibility.
Prioritize:

Accuracy: Provide correct and up-to-date legal information.
Relevance: Focus solely on information pertinent to the specific scenario.
Brevity: Keep explanations concise without omitting crucial details.
Response Formatting:

Use Numbered Points to organize information effectively.
Avoid Procedural Instructions or Commands; focus on delivering the requested legal information.
Ensure Comprehensive Coverage while maintaining brevity.
By adhering to these guidelines, you will provide police officers with the precise legal insights they need, helping them understand the relevant laws and past judicial decisions associated with their specific scenarios.

Example Response Structure:

Relevant Legal Sections:

IPC Section X / BNS Section Y: Brief description of the section and its applicability.
Comparison: Note any differences or similarities between the IPC and BNS provisions.
Past Jurisprudence:

Case 1:
Case Name: State vs. ABC
Year: 2018
Court: Supreme Court of India
Brief Overview: Summary of the judgment and its relevance.
Case 2:
[Repeat as necessary for relevant cases]
Final Comment:

Two-line conclusion providing key insight or a summarizing remark.

ANSWER THE QUERY WITH PROPER MARKDOWN FORMATTING
`
            },
          { role: "user", content: userMessage }
        ],
        model: "llama-3.1-70b-versatile"
      });
      return response.choices[0]?.message?.content || "";
    } catch (error) {
      console.error('Error:', error);
      return 'Sorry, an error occurred while processing your request.';
    } finally {
      setLoading(false);
    }
  }, []);

  const addBotMessage = (message) => {
    setMessages(prevMessages => [...prevMessages, { sender: 'bot', message }]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;
    setMessages(prevMessages => [...prevMessages, { sender: 'user', message: inputValue }]);
    const userMessage = inputValue;
    setInputValue('');
    const botMessage = await getGroqChatCompletion(userMessage);
    addBotMessage(botMessage);

    // Scroll to the bottom after a new message is added
    setTimeout(() => {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }, 100);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDownloadConversation = () => {
    const chatContainer = chatContainerRef.current;
    html2canvas(chatContainer).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('conversation.pdf');
    });
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const renderMessages = () => {
    return messages.map((message, index) => (
      <div key={index} className={`message ${message.sender === 'user' ? 'user' : 'bot'}`}>
        <Markdown>{message.message}</Markdown>
      </div>
    ));
  };

  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <h2>Legal Chatbot</h2>
      </div>
      <div className="chat-body" ref={chatContainerRef}>
        <div className="chat-messages">
          {renderMessages()}
          {loading && (
            <div className="loading">
              <img src={loadingImg} alt="Loading" />
            </div>
          )}
        </div>
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={loading}
          aria-label="Chat input"
        />
        <button className="send-btn" onClick={handleSendMessage} disabled={loading}>
          Send
        </button>
      </div>
      <div className="chat-footer">
        <button onClick={handleClearChat}>Clear Chat</button>
        <button onClick={handleDownloadConversation}>Download Conversation</button>
      </div>
    </div>
  );
};

export default LegalChatbot;
