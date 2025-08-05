import React from 'react';

interface ManagerNotificationEmailProps {
  managerName: string;
  associateName: string;
  associateEmail: string;
  dealershipName: string;
  objectionReasons: string[];
  additionalNotes?: string;
  submissionTime: string;
}

export const ManagerNotificationEmail: React.FC<ManagerNotificationEmailProps> = ({
  managerName,
  associateName,
  associateEmail,
  dealershipName,
  objectionReasons,
  additionalNotes,
  submissionTime,
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Customer Objection Alert</title>
      </head>
      <body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333', margin: '0', padding: '0' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', backgroundColor: '#f9f9f9' }}>
          {/* Header */}
          <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '20px', borderRadius: '8px 8px 0 0', textAlign: 'center' }}>
            <h1 style={{ margin: '0', fontSize: '24px' }}>🚨 Customer Objection Alert</h1>
            <p style={{ margin: '10px 0 0 0', fontSize: '16px', opacity: '0.9' }}>
              Immediate Manager Assistance Requested
            </p>
          </div>

          {/* Content */}
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '0 0 8px 8px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '16px', marginBottom: '20px' }}>
              Hello <strong>{managerName}</strong>,
            </p>

            <p style={{ fontSize: '16px', marginBottom: '20px' }}>
              <strong>{associateName}</strong> has requested your immediate assistance with a customer objection at <strong>{dealershipName}</strong>.
            </p>

            {/* Alert Box */}
            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '6px', padding: '16px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#92400e', fontSize: '16px' }}>
                ⏰ Time of Request: {submissionTime}
              </h3>
              <p style={{ margin: '0', color: '#92400e', fontSize: '14px' }}>
                This is a real-time alert. Please respond as soon as possible.
              </p>
            </div>

            {/* Objection Details */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '18px', color: '#374151', marginBottom: '15px', borderBottom: '2px solid #e5e7eb', paddingBottom: '5px' }}>
                Customer Objection Reasons:
              </h3>
              <ul style={{ paddingLeft: '20px', margin: '0' }}>
                {objectionReasons.map((reason, index) => (
                  <li key={index} style={{ fontSize: '16px', marginBottom: '8px', color: '#4b5563' }}>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {/* Additional Notes */}
            {additionalNotes && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '18px', color: '#374151', marginBottom: '15px', borderBottom: '2px solid #e5e7eb', paddingBottom: '5px' }}>
                  Additional Notes:
                </h3>
                <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '15px' }}>
                  <p style={{ margin: '0', fontSize: '16px', color: '#4b5563', fontStyle: 'italic' }}>
                    &ldquo;{additionalNotes}&rdquo;
                  </p>
                </div>
              </div>
            )}

            {/* Associate Contact */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '18px', color: '#374151', marginBottom: '15px', borderBottom: '2px solid #e5e7eb', paddingBottom: '5px' }}>
                Associate Contact:
              </h3>
              <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '6px', padding: '15px' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '16px' }}>
                  <strong>Name:</strong> {associateName}
                </p>
                <p style={{ margin: '0', fontSize: '16px' }}>
                  <strong>Email:</strong> <a href={`mailto:${associateEmail}`} style={{ color: '#0ea5e9' }}>{associateEmail}</a>
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <div style={{ backgroundColor: '#dc2626', color: 'white', padding: '15px 30px', borderRadius: '6px', display: 'inline-block' }}>
                <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
                  🏃‍♂️ Please respond immediately to assist your team member
                </p>
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
              <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                This notification was sent from the {dealershipName} Sales Enablement System
              </p>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                Automated message - please do not reply to this email
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};