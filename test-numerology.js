// Quick test of numerology calculation
import { calculateNumerologyData } from './src/lib/numerology'

// Test with sample Vietnamese name
const testName = "Nguyễn Văn An"
const testBirthDate = "1990-01-15"

console.log("Testing numerology calculation...")
console.log(`Name: ${testName}`)
console.log(`Birth Date: ${testBirthDate}`)
console.log("Numerology Data:")
console.log(JSON.stringify(calculateNumerologyData(testName, testBirthDate), null, 2))
