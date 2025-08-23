const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yufuxgibfmkqtvvlprmv.supabase.co';
const supabaseKey = 'sb_publishable_dhy8sr7DbQ1hIxx2H6Nd-Q_HWYH4Xe0';

console.log('Testing document insertion...');

if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey, {
    db: {
      schema: 'dulieu_congviec'
    }
  });

  // First get a customer ID
  supabase
    .from('customers')
    .select('customer_id')
    .limit(1)
    .then(result => {
      console.log('Customer found:', result);
      if (result.data && result.data.length > 0) {
        const customerId = result.data[0].customer_id;
        
        // Try to insert a test document
        return supabase
          .from('documents')
          .insert({
            document_type: 'hop_dong_tin_dung',
            customer_id: customerId,
            file_name: 'test-document.docx',
            file_url: 'https://example.com/test.docx'
          })
          .select();
      } else {
        throw new Error('No customers found');
      }
    })
    .then(result => {
      console.log('Document insertion result:', result);
    })
    .catch(error => {
      console.error('Error:', error);
    });
} else {
  console.error('Missing environment variables!');
}
