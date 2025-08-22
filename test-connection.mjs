// Simple test to diagnose document generation issues
import { supabase } from './src/lib/supabase.js';

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  if (!supabase) {
    console.error('❌ Supabase client is null - check environment variables');
    return;
  }
  
  console.log('✅ Supabase client created successfully');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('customers').select('count', { count: 'exact' });
    if (error) {
      console.error('❌ Database connection error:', error.message);
    } else {
      console.log('✅ Database connection successful, customers count:', data);
    }
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
  }
  
  try {
    // Test fetching a customer
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('❌ Customer fetch error:', error.message);
    } else {
      console.log('✅ Sample customer data:', data);
    }
  } catch (err) {
    console.error('❌ Customer fetch failed:', err.message);
  }
  
  try {
    // Test fetching credit assessments
    const { data, error } = await supabase
      .from('credit_assessments')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('❌ Credit assessment fetch error:', error.message);
    } else {
      console.log('✅ Sample credit assessment data:', data);
    }
  } catch (err) {
    console.error('❌ Credit assessment fetch failed:', err.message);
  }
}

testConnection().then(() => {
  console.log('Test completed');
  process.exit(0);
}).catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
