// ReceiptComponent.jsx

import React, { useEffect } from 'react';

const ReceiptComponent = React.forwardRef(({ membership, onRenderComplete }, ref) => {
  useEffect(() => {
    if (onRenderComplete) {
      onRenderComplete();
    }
  }, [onRenderComplete]);

  return (
    <div
      ref={ref}
      style={{
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        border: '1px solid #ccc',
        width: '600px',
        margin: '0 auto',
        backgroundColor: '#fff',
        color: '#000',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: '0', fontSize: '24px' }}>Her Chamber Fitness Membership Receipt</h2>
     
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          Date: {new Date().toLocaleDateString()}
        </p>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #ccc' }} />

      {/* Member Information */}
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Member Information</h3>
        <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>Name</td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                {membership.users?.name || 'Unknown User'}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>Mobile Number</td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                {membership.users?.mobile_number_1 || 'N/A'}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>Email</td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                {membership.users?.email || 'N/A'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Membership Details */}
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Membership Details</h3>
        <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>Plan</td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                {membership.membership_plans?.name || 'Unknown Plan'}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>Start Date</td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                {membership.start_date}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>End Date</td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                {membership.end_date}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Details */}
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Payment Details</h3>
        <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                Admission/Renewal Fee
              </td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                Rs {membership.admission_or_renewal_fee}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>Additional Fee</td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                Rs {membership.additional_fee}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>GST Percentage</td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                {membership.gst_percentage}%
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>Credit Used</td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                Rs {membership.credit_used}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>
                Total Amount
              </td>
              <td
                style={{
                  padding: '8px',
                  border: '1px solid #ccc',
                  fontWeight: 'bold',
                  color: '#d32f2f',
                }}
              >
                Rs {membership.total_amount}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <p style={{ margin: '0', fontSize: '14px' }}>
          Thank you for your membership!
        </p>
        <p style={{ margin: '5px 0', fontSize: '12px', color: '#555' }}>
          If you have any questions, please contact us at support@example.com.
        </p>
      </div>
    </div>
  );
});

export default ReceiptComponent;
