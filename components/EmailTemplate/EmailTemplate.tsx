import * as React from 'react';

interface SelectedChoice {
    id: string;
    choice: string; // Make sure the choice is a string
  }
  
  interface EmailTemplateProps {
    managerEmail: string;
    selectedChoices: SelectedChoice[]; // Now it's an array of objects
    comment?: string;
  }

  export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
    managerEmail,
    selectedChoices,
    comment,
  }) => (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', padding: '20px' }}>
      <h1 style={{ color: '#4CAF50' }}>Hello, {managerEmail}!</h1>
      <p>Thank you for your submission. Here’s a summary of your choices:</p>
  
      <ul>
        {selectedChoices.map((choice, index) => (
          <li key={index} style={{ marginBottom: '5px' }}>
            {choice.choice} {/* Render the 'choice' property */}
          </li>
        ))}
      </ul>
  
      {comment && (
        <>
          <h3>Additional Comments:</h3>
          <p style={{ fontStyle: 'italic' }}>{comment}</p>
        </>
      )}
  
      <p>We appreciate your time. If you have any questions, feel free to reach out.</p>
  
      <p>Best regards,<br/>The Team</p>
    </div>
  );