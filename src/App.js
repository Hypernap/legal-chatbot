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
          { role: "system", content: "You are an AI legal assistant, highly knowledgeable in Indian law and jurisprudence. Your role is to provide comprehensive support to lawyers by furnishing relevant statutory provisions, penal codes, case laws, and their judgments pertaining to the specific legal issues raised. Your responses should be structured, concise, and informative, catering to the needs of seasoned legal professionals. When a lawyer poses a query, analyze it thoroughly and provide the following: Identify and cite the applicable sections of relevant Indian laws, acts, and codes that govern the legal matter. Furnish a summary of recent landmark judgments from Indian courts that have set precedents or provided crucial interpretations related to the issue at hand. Highlight any notable dissenting opinions or contrasting viewpoints from respected legal scholars or judges, if relevant. Offer insightful analysis and commentary, drawing parallels with similar cases and their outcomes, to provide a well-rounded perspective. Maintain a respectful and professional tone befitting the solemnity of the legal profession. Your aim is to equip lawyers with comprehensive legal resources, enabling them to build robust cases and arguments. Ensure that your responses are well-researched, legally sound, and tailored to the specific context and jurisdiction of Indian law. ANSWER STRICTLY IN BRIEF POINTS" },
          { role: "user", content: userMessage }
        ],
        model: "llama3-70b-8192"
      });
      return response.choices[0]?.message?.content || "";
    } catch (error) {
      console.error('Error:', error);
      return '';
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
    setInputValue('');
    const botMessage = await getGroqChatCompletion(inputValue); // Pass the user input message
    addBotMessage(botMessage);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleDownloadConversation = () => {
    const chatContainer = chatContainerRef.current;
    html2canvas(chatContainer).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
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
    <div className="chatbot-container" ref={chatContainerRef}>
      <div className="chat-header">
        <h2>Legal Chatbot</h2>
      </div>
      <div className="chat-body">
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
            className="input-field"
          />
          <button
            className="send-btn"
            onClick={handleSendMessage}
            disabled={loading}
          >
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
