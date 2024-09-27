import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { FaCheck } from 'react-icons/fa';
import logo from '../assets/log.png';

const PARQForm = () => {
  const [formData, setFormData] = useState({
    name: '', date: '', height: '', weight: '', age: '',
    physiciansName: '', phone: '', occupation: '', recreationalActivities: '', hobbies: '',
    painOrInjuries: '', surgeries: '', chronicDiseases: '', medications: '',
  });

  const [answers, setAnswers] = useState(Array(11).fill('no')); // Yes/No answers for relevant questions
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: `
      @page { 
        size: auto; 
        margin: 15mm 10mm; 
      }
      body {
        font-family: 'Arial', sans-serif;
      }
      .print-button {
        display: none;
      }
    `,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAnswerClick = (index, answer) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = answer;
    setAnswers(updatedAnswers);
    if (answer === 'no') {
      setFormData(prev => ({ ...prev, [index]: '' })); // Clear explanation if 'No' is selected
    }
  };

  const renderYesNoQuestion = (index, question, fieldName) => (
    <tr key={index} className="border-t border-gray-300"> {/* Adds line separation */}
      <td className="text-center py-2 px-4 border-r border-gray-300">{index + 1}</td> {/* Added padding */}
      <td className="py-2 px-2 pr-4 border-l" style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
        <p>{question}</p>
        {answers[index] === 'yes' && (
          <textarea
            name={fieldName}
            value={formData[fieldName]}
            onChange={handleInputChange}
            className="mt-2 block w-full border-b border-gray-300"
            placeholder="Please explain"
            style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap', resize: 'none' }} // Ensures text wraps and input size remains consistent
            rows={2}
          />
        )}
      </td>
      <td className="text-center border-l border-gray-300 w-16">
        <div className="w-6 h-6 mx-auto cursor-pointer" onClick={() => handleAnswerClick(index, 'yes')}>
          {answers[index] === 'yes' ? <FaCheck /> : null}
        </div>
      </td>
      <td className="text-center border-l border-gray-300 w-16">
        <div className="w-6 h-6 mx-auto cursor-pointer" onClick={() => handleAnswerClick(index, 'no')}>
          {answers[index] === 'no' ? <FaCheck /> : null}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 form-container">
    
      <div ref={componentRef} className="bg-white p-4 border border-gray-300">
        <div className="flex justify-end mb-4 h-40">
          <img src={logo} alt="Her Chamber Fitness logo" />
        </div>

        {/* Personal Information Fields */}
        <div className="max-w-xl mx-auto mb-10">
          <div className="mb-4">
            <div className="flex justify-between">
              <div className="flex-grow mr-4">
                <label className="text-sm font-medium text-gray-700">NAME:</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full border-b border-gray-300 font-bold" />
              </div>
              <div className="w-1/3">
                <label className="text-sm font-medium text-gray-700">DATE:</label>
                <input type="text" name="date" value={formData.date} onChange={handleInputChange} className="mt-1 block w-full border-b border-gray-300 font-bold" />
              </div>
            </div>
          </div>

          <div className="flex justify-between mb-4">
            <div className="w-1/4">
              <label className="text-sm font-medium text-gray-700">HEIGHT:</label>
              <div className="flex items-center">
                <input type="text" name="height" value={formData.height} onChange={handleInputChange} className="mt-1 block w-full border-b border-gray-300 font-bold" />
                <span className="ml-1">in.</span>
              </div>
            </div>
            <div className="w-1/4">
              <label className="text-sm font-medium text-gray-700">WEIGHT:</label>
              <div className="flex items-center">
                <input type="text" name="weight" value={formData.weight} onChange={handleInputChange} className="mt-1 block w-full border-b border-gray-300 font-bold" />
                <span className="ml-1">lbs.</span>
              </div>
            </div>
            <div className="w-1/4">
              <label className="text-sm font-medium text-gray-700">AGE:</label>
              <input type="text" name="age" value={formData.age} onChange={handleInputChange} className="mt-1 block w-full border-b border-gray-300 font-bold" />
            </div>
          </div>

          <div className="flex justify-between mb-4">
            <div className="w-1/2 mr-4">
              <label className="text-sm font-medium text-gray-700">PHYSICIANS NAME:</label>
              <input type="text" name="physiciansName" value={formData.physiciansName} onChange={handleInputChange} className="mt-1 block w-full border-b border-gray-300 font-bold" />
            </div>
            <div className="w-1/2">
              <label className="text-sm font-medium text-gray-700">PHONE:</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full border-b border-gray-300 font-bold" />
            </div>
          </div>
        </div>

        {/* PAR-Q Questions */}
        <h2 className="text-xl font-bold mb-4 text-center">PHYSICAL ACTIVITY READINESS QUESTIONNAIRE (PAR-Q)</h2>

        <div className="mx-auto" style={{ width: '90%' }}>
          <table className="w-full mb-4 border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="w-10 text-center py-2 px-2 font-bold border-b border-gray-300">#</th>
                <th className="text-left py-2 px-2 font-bold border-b border-gray-300 border-l">Questions</th>
                <th className="w-16 text-center py-2 font-bold border-b border-gray-300">Yes</th>
                <th className="w-16 text-center py-2 font-bold border-b border-gray-300">No</th>
              </tr>
            </thead>
            <tbody>
              {[
                'Has your doctor ever said that you have a heart condition and that you should only perform physical activity recommended by a doctor?',
                'Do you feel pain in your chest when you perform physical activity?',
                'In the past month, have you had chest pain when you were not performing any physical activity?',
                'Do you lose your balance because of dizziness or do you ever lose consciousness?',
                'Do you have a bone or joint problem that could be made worse by a change in your physical activity?',
                'Is your doctor currently prescribing any medication for your blood pressure or for a heart condition?',
                'Do you know of any other reason why you should not engage in physical activity?',
              ].map((question, index) => renderYesNoQuestion(index, question))}
            </tbody>
          </table>
        </div>

        <p className="text-sm italic mb-8">
          If you have answered "Yes" to one or more of the above questions, consult your physician before
          engaging in physical activity. Tell your physician which questions you answered "Yes" to. After a
          medical evaluation, seek advice from your physician on what type of activity is suitable for your
          current condition.
        </p>

        {/* GENERAL & MEDICAL QUESTIONNAIRE */}
        <h2 className="text-xl font-bold mb-4 text-center">GENERAL & MEDICAL QUESTIONNAIRE</h2>

        <div className="mx-auto" style={{ width: '90%' }}>
          <h3 className="font-bold mb-2">Occupational Questions</h3>
          <table className="w-full mb-4 border-collapse border border-gray-300">
            <tbody>
              {renderYesNoQuestion(0, 'What is your current occupation?')}
              {renderYesNoQuestion(1, 'Does your occupation require extended periods of sitting?')}
              {renderYesNoQuestion(2, 'Does your occupation require extended periods of repetitive movements? (If yes, please explain.)')}
              {renderYesNoQuestion(3, 'Does your occupation require you to wear shoes with a heel (dress shoes)?')}
              {renderYesNoQuestion(4, 'Does your occupation cause you anxiety (mental stress)?')}
            </tbody>
          </table>

          <h3 className="font-bold mb-2">Recreational Questions</h3>
          <table className="w-full mb-4 border-collapse border border-gray-300">
            <tbody>
              {renderYesNoQuestion(5, 'Do you partake in any recreational activities (golf, tennis, skiing, etc.)? (If yes, please explain.)')}
              {renderYesNoQuestion(6, 'Do you have any hobbies (reading, gardening, working on cars, exploring the Internet, etc.)? (If yes, please explain.)')}
            </tbody>
          </table>

          <h3 className="font-bold mb-2">Medical Questions</h3>
          <table className="w-full mb-4 border-collapse border border-gray-300">
            <tbody>
              {renderYesNoQuestion(7, 'Have you ever had any pain or injuries (ankle, knee, hip, back, shoulder, etc.)? (If yes, please explain.)')}
              {renderYesNoQuestion(8, 'Have you ever had any surgeries? (If yes, please explain.)')}
              {renderYesNoQuestion(9, 'Has a medical doctor ever diagnosed you with a chronic disease, such as coronary heart disease, coronary artery disease, hypertension, high cholesterol, or diabetes? (If yes, please explain.)')}
              {renderYesNoQuestion(10, 'Are you currently taking any medication? (If yes, please list.)')}
            </tbody>
          </table>
        </div>
      </div>
      <button onClick={handlePrint} className="print-button mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Print Form
      </button>
    </div>
  );
};

export default PARQForm;
