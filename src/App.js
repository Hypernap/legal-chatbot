import React, { useState, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './App.css';
import loadingImg from './loading.gif'; // Import the loading.gif file
import Groq from "groq-sdk"; // Import Groq SDK
import ReactMarkdown from 'react-markdown'


const LegalChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);
  console.log('userMessage');


  const getGroqChatCompletion = useCallback(async (userMessage) => {
    try {
        setLoading(true);
        console.log(userMessage);
        const groq = new Groq({ dangerouslyAllowBrowser: true, apiKey: process.env.REACT_APP_GROQ });
        // Step 1: Categorize the prompt
        const categorizationResponse = await groq.chat.completions.create({
        messages: [
        { role: "system", content: `Categorize the following user query into one of these categories:
                - **Offences Affecting the Human Body (Hurt)**
                - **Offences Against Woman and Child**
                - **Offences Against Property**
                - **Offences Against the State**
                - **Offences Relating to Public Servants**
                - **Offences Relating to Elections**
                - **Offences Against the Public Tranquility**
                - **Offences Relating to Coin, Currency-Notes, Bank-Notes, and Government Stamps**
                - **Offences Against Religion**
                - **Offences Affecting the Public Health, Safety, Convenience, Decency and Morals**
                 - **General Exceptions**
                  - **Other Criminal Offenses**

                Return only one category.
                ONLY RETURN THE CATEGORY NAME, NO OTHER TEXT.
                `
        },
            { role: "user", content: userMessage },
        ],
        model: "llama-3.3-70b-versatile"
        });
        const category = categorizationResponse.choices[0]?.message?.content.trim().replaceAll("**", "");
        
        console.log(`Detected category: ${category}`);

        // Step 2: Filter BNS sections based on the category
        let bnsSections = "";
        if(category === "Offences Affecting the Human Body (Hurt)") {
          bnsSections =`
          Chapter VI	Of Offences Affecting the Human Body
          Of hurt
          Section 114	Hurt.
          Section 115	Voluntarily causing hurt.
          Section 116	Grievous hurt.
          Section 117	Voluntarily causing grievous hurt.
          Section 118	Voluntarily causing hurt or grievous hurt by dangerous weapons or means.
          Section 119	Voluntarily causing hurt or grievous hurt to extort property, or to constrain to an illegal act.
          Section 120	Voluntarily causing hurt or grievous hurt to extort confession, or to compel restoration of property.
          Section 121	Voluntarily causing hurt or grievous hurt to deter public servant from his duty.
          Section 122	Voluntarily causing hurt or grievous hurt on provocation.
          Section 123	Causing hurt by means of poison, etc., with intent to commit an offence.
          Section 124	Voluntarily causing grievous hurt by use of acid, etc.
          Section 125	Act endangering life or personal safety of others
          `;
        } else if (category === "Offences Against Woman and Child") {
           bnsSections = `
            Chapter V	Of Offences Against Woman and Child
            Of sexual offences
            Section 63	Rape.
            Section 64	Punishment for rape.
            Section 65	Punishment for rape in certain cases.
            Section 66	Punishment for causing death or resulting in persistent vegetative state of victim.
            Section 67	Sexual intercourse by husband upon his wife during separation.
            Section 68	Sexual intercourse by a person in authority.
            Section 69	Sexual intercourse by employing deceitful means, etc.
            Section 70	Gang rape.
            Section 71	Punishment for repeat offenders.
            Section 72	Disclosure of identity of victim of certain offences, etc.
            Section 73	Printing or publishing of any matter relating to Court proceedings without permission.
            Of criminal force and assault against woman
            Section 74	Assault or use of criminal force to woman with intent to outrage her modesty.
            Section 75	Sexual harassment.
            Section 76	Assault or use of criminal force to woman with intent to disrobe.
            Section 77	Voyeurism.
            Section 78	Stalking.
            Section 79	Word, gesture or act intended to insult modesty of a woman.
            Of offences relating to marriage
            Section 80	Dowry death
            Section 81	Cohabitation caused by man deceitfully inducing belief of lawful marriage.
            Section 82	Marrying again during lifetime of husband or wife.
            Section 83	Marriage ceremony fraudulently gone through without lawful marriage.
            Section 84	Enticing or taking away or detaining with criminal intent a married woman.
            Section 85	Husband or relative of husband of a woman subjecting her to cruelty.
            Section 86	Cruelty defined.
            Section 87	Kidnapping, abducting or inducing woman to compel her marriage, etc.
            Of causing miscarriage, etc.
            Section 88	Causing miscarriage.
            Section 89	Causing miscarriage without woman’s consent.
            Section 90	Death caused by act done with intent to cause miscarriage.
            Section 91	Act done with intent to prevent child being born alive or to cause to die after birth.
            Section 92	Causing death of quick unborn child by act amounting to culpable homicide.
            Of offences against child
            Section 93	Exposure and abandonment of child under twelve years of age, by parent or person having care of it.
            Section 94	Concealment of birth by secret disposal of dead body.
            Section 95	Hiring, employing or engaging a child to commit an offence.
            Section 96	Procuration of child.
            Section 97	Kidnapping or abducting child under ten years of age with intent to steal from its person.
            Section 98	Selling child for purposes of prostitution, etc.
            Section 99	Buying child for purposes of prostitution, etc.
          `;
        } else if(category === "Offences Against Property"){
             bnsSections = `
            Chapter XVII	Of Offences Against Property
              Section 303	Theft.
              Section 304	Snatching.
              Section 305	Theft in a dwelling house, or means of transportation or place of worship, etc.
              Section 306	Theft by clerk or servant of property in possession of master.
              Section 307	Theft after preparation made for causing death, hurt or restraint in order to committing of theft.
              Of extortion
              Section 308	Extortion
              Of robbery and dacoity
              Section 309	Robbery.
              Section 310	Dacoity.
              Section 311	Robbery, or dacoity, with attempt to cause death or grievous hurt.
              Section 312	Attempt to commit robbery or dacoity when armed with deadly weapon.
              Section 313	Punishment for belonging to gang of robbers, etc.
              Of criminal misappropriation of property
              Section 314	Dishonest misappropriation of property
              Section 315	Dishonest misappropriation of property possessed by deceased person at the time of his death.
              Of criminal breach of trust
              Section 316	Criminal breach of trust.
              Of receiving stolen property
              Section 317	Stolen property.
              Of cheating
              Section 318	Cheating
              Section 319	Cheating by personation.
              Of fraudulent deeds and dispositions of property
              Section 320	Dishonest or fraudulent removal or concealment of property to prevent distribution among creditors.
              Section 321	Dishonestly or fraudulently preventing debt being available for creditors.
              Section 322	Dishonest or fraudulent execution of deed of transfer containing false statement of consideration.
              Section 323	Dishonest or fraudulent removal or concealment of property.
              Of mischief
              Section 324	Mischief.
              Section 325	Mischief by killing or maiming animal.
              Section 326	Mischief by injury, inundation, fire or explosive substance, etc.
              Section 327	Mischief with intent to destroy or make unsafe a rail, aircraft, decked vessel or one of twenty tons burden.
              Section 328	Punishment for intentionally running vessel aground or ashore with intent to commit theft, etc.
              Of criminal trespass
              Section 329	Criminal trespass and house-trespass.
              Section 330	House-trespass and house-breaking.
              Section 331	Punishment for house-trespass or house-breaking.
              Section 332	House-trespass in order to commit offence.
              Section 333	House-trespass after preparation for hurt, assault or wrongful restraint.
              Section 334	Dishonestly breaking open receptacle containing property.
          `;
        } else if(category === "Offences Against the State"){
          bnsSections = `
            Chapter VII	Of Offences Against the State
            Section 147	Waging, or attempting to wage war, or abetting waging of war, against Government of India.
            Section 148	Conspiracy to commit offences punishable by section 147.
            Section 149	Collecting arms, etc., with intention of waging war against Government of India.
            Section 150	Concealing with intent to facilitate design to wage war.
            Section 151	Assaulting President, Governor, etc., with intent to compel or restrain exercise of any lawful power.
            Section 152	Act endangering sovereignty, unity and integrity of India.
            Section 153	Waging war against Government of any foreign State at peace with Government of India.
            Section 154	Committing depredation on territories of foreign State at peace with Government of India.
            Section 155	Receiving property taken by war or depredation mentioned in sections 153 and 154.
            Section 156	Public servant voluntarily allowing prisoner of State or war to escape.
            Section 157	Public servant negligently suffering such prisoner to escape.
            Section 158	Aiding escape of, rescuing or harbouring such prisoner.
           `;
        }else if (category === "Offences Relating to Public Servants") {
              bnsSections = `
              Chapter XII	Of Offences by or Relating to Public Servants
              Section 198	Public servant disobeying law, with intent to cause injury to any person.
              Section 199	Public servant disobeying direction under law.
              Section 200	Punishment for non-treatment of victim.
              Section 201	Public servant framing an incorrect document with intent to cause injury.
              Section 202	Public servant unlawfully engaging in trade.
              Section 203	Public servant unlawfully buying or bidding for property.
              Section 204	Personating a public servant.
              Section 205	Wearing garb or carrying token used by public servant with fraudulent intent.
              `;
        }else if (category === "Offences Relating to Elections"){
               bnsSections = `
                Chapter IX	Of Offences Relating to Elections
                Section 169	Candidate, electoral right defined.
                Section 170	Bribery.
                Section 171	Undue influence at elections.
                Section 172	Personation at elections.
                Section 173	Punishment for bribery.
                Section 174	Punishment for undue influence or personation at an election.
                Section 175	False statement in connection with an election.
                Section 176	Illegal payments in connection with an election.
                Section 177	Failure to keep election accounts.
                `;
        }else if(category === "Offences Against the Public Tranquility"){
            bnsSections =`
            Chapter XI	Of Offences Against the Public Tranquility
              Section 189	Unlawful assembly.
              Section 190	Every member of unlawful assembly guilty of offence committed in prosecution of common object.
              Section 191	Rioting.
              Section 192	Wantonly giving provocation with intent to cause riot-if rioting be committed; if not committed.
              Section 193	Liability of owner, occupier, etc., of land on which an unlawful assembly or riot takes place.
              Section 194	Affray.
              Section 195	Assaulting or obstructing public servant when suppressing riot, etc.
              Section 196	Promoting enmity between different groups on grounds of religion, race, place of birth, residence, language, etc., and doing acts prejudicial to maintenance of harmony.
              Section 197	Imputations, assertions prejudicial to national integration.
              `;
        }else if (category === "Offences Relating to Coin, Currency-Notes, Bank-Notes, and Government Stamps"){
            bnsSections = `
            Chapter X	Of Offences Relating to Coin, Currency-Notes, Bank-Notes, and Government Stamps
              Section 178	Counterfeiting coin, Government stamps, currency-notes or bank-notes.
              Section 179	Using as genuine, forged or counterfeit coin, Government stamp, currency-notes or bank-notes.
              Section 180	Possession of forged or counterfeit coin, Government stamp, currency-notes or bank-notes.
              Section 181	Making or possessing instruments or materials for forging or counterfeiting coin, Government stamp, currency-notes or bank-notes.
              Section 182	Making or using documents resembling currency-notes or bank-notes.
              Section 183	Effacing writing from substance bearing Government stamp, or removing from document a stamp used for it, with intent to cause loss to Government.
              Section 184	Using Government stamp known to have been before used.
              Section 185	Erasure of mark denoting that stamp has been used.
              Section 186	Prohibition of fictitious stamps.
              Section 187	Person employed in mint causing coin to be of different weight or composition from that fixed by law.
              Section 188	Unlawfully taking coining instrument from mint.
            `;
        }else if(category === "Offences Against Religion"){
             bnsSections = `
              Chapter XVI	Of Offences Relating to Religion
              Section 298	Injuring or defiling place of worship with intent to insult religion of any class.
              Section 299	Deliberate and malicious acts, intended to outrage religious feelings of any class by insulting its religion or religious beliefs.
              Section 300	Disturbing religious assembly.
              Section 301	Trespassing on burial places, etc.
              Section 302	Uttering words, etc., with deliberate intent to wound religious feelings of any person.
            `;
        }else if(category === "Offences Affecting the Public Health, Safety, Convenience, Decency and Morals"){
            bnsSections =`
             Chapter XV	Of Offences Affecting the Public Health, Safety, Convenience, Decency and Morals
                Section 270	Public nuisance.
                Section 271	Negligent act likely to spread infection of disease dangerous to life.
                Section 272	Malignant act likely to spread infection of disease dangerous to life.
                Section 273	Disobedience to quarantine rule.
                Section 274	Adulteration of food or drink intended for sale.
                Section 275	Sale of noxious food or drink.
                Section 276	Adulteration of drugs.
                Section 277	Sale of adulterated drugs.
                Section 278	Sale of drug as a different drug or preparation.
                Section 279	Fouling water of public spring or reservoir.
                Section 280	Making atmosphere noxious to health.
                Section 281	Rash driving or riding on a public way.
                Section 282	Rash navigation of vessel.
                Section 283	Exhibition of false light, mark or buoy.
                Section 284	Conveying person by water for hire in unsafe or overloaded vessel.
                Section 285	Danger or obstruction in public way or line of navigation.
                Section 286	Negligent conduct with respect to poisonous substance.
                Section 287	Negligent conduct with respect to fire or combustible matter.
                Section 288	Negligent conduct with respect to explosive substance.
                Section 289	Negligent conduct with respect to machinery.
                Section 290	Negligent conduct with respect to pulling down, repairing or constructing buildings, etc.
                Section 291	Negligent conduct with respect to animal.
                Section 292	Punishment for public nuisance in cases not otherwise provided for.
                Section 293	Continuance of nuisance after injunction to discontinue.
                Section 294	Sale, etc., of obscene books, etc.
                Section 295	Sale, etc., of obscene objects to child.
                Section 296	Obscene acts and songs.
                Section 297	Keeping lottery office
            `;
        } else if(category === "General Exceptions"){
            bnsSections =`
              Chapter III	General Exceptions
              Section 14	Act done by a person bound, or by mistake of fact believing himself bound, by law.
              Section 15	Act of Judge when acting judicially.
              Section 16	Act done pursuant to judgment or order of Court.
              Section 17	Act done by a person justified, or by mistake of fact believing himself justified, by law.
              Section 18	Accident in doing a lawful act.
              Section 19	Act likely to cause harm, but done without criminal intent, and to prevent other harm.
              Section 20	Act of a child under seven years of age.
              Section 21	Act of a child above seven and under twelve years of age of immature understanding.
              Section 22	Act of a person of unsound mind.
              Section 23	Act of a person incapable of judgment by reason of intoxication caused against his will.
              Section 24	Offence requiring a particular intent or knowledge committed by one who is intoxicated.
              Section 25	Act not intended and not known to be likely to cause death or grievous hurt, done by consent.
              Section 26	Act not intended to cause death, done by consent in good faith for person’s benefit.
              Section 27	Act done in good faith for benefit of child or person of unsound mind, by, or by consent of guardian.
              Section 28	Consent known to be given under fear or misconception.
              Section 29	Exclusion of acts which are offences independently of harm caused.
              Section 30	Act done in good faith for benefit of a person without consent.
              Section 31	Communication made in good faith.
              Section 32	Act to which a person is compelled by threats.
              Section 33	Act causing slight harm.
              Of right of private defence
              Section 34	Things done in private defence.
              Section 35	Right of private defence of body and of property.
              Section 36	Right of private defence against act of a person of unsound mind, etc.
              Section 37	Acts against which there is no right of private defence
              Section 38	When right of private defence of body extends to causing death.
              Section 39	When such right extends to causing any harm other than death.
              Section 40	Commencement and continuance of right of private defence of body.
              Section 41	When right of private defence of property extends to causing death.
              Section 42	When such right extends to causing any harm other than death.
              Section 43	Commencement and continuance of right of private defence of property.
              Section 44	Right of private defence against deadly assault when there is risk of harm to innocent person.
            `;
        }else{
            bnsSections = `
              Chapter II	Of Punishments
              Section 4	Punishments.
              Section 5	Commutation of sentence.
              Section 6	Fractions of terms of punishment.
              Section 7	Sentence may be (in certain cases of imprisonment) wholly or partly rigorous or simple.
              Section 8	Amount of fine, liability in default of payment of fine, etc.
              Section 9	Limit of punishment of offence made up of several offences.
              Section 10	Punishment of person guilty of one of several offences, judgment stating that it is doubtful of which.
              Section 11	Solitary confinement.
              Section 12	Limit of solitary confinement.
              Section 13	Enhanced punishment for certain offences after previous conviction.
            `;
        }
      
      const finalPrompt = `
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
      
          Below is BNS (Strictly follow this):-
      
          ${bnsSections}
      
          ANSWER THE QUERY WITH PROPER MARKDOWN FORMATTING
        `;

      const response = await groq.chat.completions.create({
        messages: [
          { role: "system", content: finalPrompt },
          { role: "user", content: userMessage }
        ],
        model: "llama-3.3-70b-versatile"
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
          <ReactMarkdown className={'reactMarkDown'}>{message.message}</ReactMarkdown>
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
