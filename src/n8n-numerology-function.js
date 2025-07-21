// n8n Code Function for Numerology Calculations
// This function takes fullName and birthDay as input and returns numerology analysis

// Helper function to remove Vietnamese accents
function removeAccents(str) {
  const accents = {
    'a': 'áàạảãâấầậẩẫăắằặẳẵ',
    'e': 'éèẹẻẽêếềệểễ',
    'i': 'íìịỉĩ',
    'o': 'óòọỏõôốồộổỗơớờợởỡ',
    'u': 'úùụủũưứừựửữ',
    'y': 'ýỳỵỷỹ',
    'd': 'đ',
    'A': 'ÁÀẠẢÃÂẤẦẬẨẪĂẮẰẶẲẴ',
    'E': 'ÉÈẸẺẼÊẾỀỆỂỄ',
    'I': 'ÍÌỊỈĨ',
    'O': 'ÓÒỌỎÕÔỐỒỘỔỖƠỚỜỢỞỠ',
    'U': 'ÚÙỤỦŨƯỨỪỰỬỮ',
    'Y': 'ÝỲỴỶỸ',
    'D': 'Đ'
  };

  for (let nonAccent in accents) {
    const accent = accents[nonAccent];
    for (let i = 0; i < accent.length; i++) {
      str = str.replace(new RegExp(accent.charAt(i), 'g'), nonAccent);
    }
  }
  return str;
}

// Helper function to get alphabet values
function getValueInAlphabets(char) {
  const alphabets = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
    J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
    S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8
  };
  return alphabets[char] || 0;
}

// Helper function to sum adjacent numbers and reduce to single digit
function sumAdjacent(num1, num2 = 0, type = "") {
  const sum = Number(num1) + Number(num2);
  if (type === "mature" && [11, 22, 33].includes(sum)) {
    return sum;
  }
  if (type === "finalWay" && [11, 22].includes(sum)) {
    return sum;
  }
  
  let result = sum;
  while (result > 9 && ![11, 22, 33].includes(result)) {
    result = result.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  return result;
}

// Helper function to subtract adjacent numbers
function substractAdjacent(num1, num2) {
  return Math.abs(Number(num1) - Number(num2));
}

// Get walks of life from birth date
function getWalksOfLife(birthDay) {
  const date = new Date(birthDay);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  const sum = day + month + year;
  return sumAdjacent(sum);
}

// Get mission from name
function getMission(name) {
  const nameWithoutSpaces = name.replace(/\s/g, '');
  let sum = 0;
  for (let char of nameWithoutSpaces) {
    sum += getValueInAlphabets(char);
  }
  return sumAdjacent(sum);
}

// Get soul number from vowels in name
function getSoul(name) {
  const vowels = ['A', 'E', 'I', 'O', 'U', 'Y'];
  const nameWithoutSpaces = name.replace(/\s/g, '');
  let sum = 0;
  for (let char of nameWithoutSpaces) {
    if (vowels.includes(char)) {
      sum += getValueInAlphabets(char);
    }
  }
  return sumAdjacent(sum);
}

// Get personality from consonants in name
function getPersonality(nameArray) {
  const vowels = ['A', 'E', 'I', 'O', 'U', 'Y'];
  let sum = 0;
  for (let char of nameArray) {
    if (!vowels.includes(char)) {
      sum += getValueInAlphabets(char);
    }
  }
  return sumAdjacent(sum);
}

// Get passion from name
function getPassion(nameArray) {
  let sum = 0;
  for (let char of nameArray) {
    sum += getValueInAlphabets(char);
  }
  return sumAdjacent(sum);
}

// Get balance from first letter of first and last name
function getBalance(completedName) {
  const names = completedName.trim().split(' ').filter(name => name.length > 0);
  if (names.length === 0) return 0;
  
  const firstNameFirstLetter = names[0][0];
  const lastNameFirstLetter = names[names.length - 1][0];
  
  return sumAdjacent(
    getValueInAlphabets(firstNameFirstLetter) + 
    getValueInAlphabets(lastNameFirstLetter)
  );
}

// Get missing numbers
function getMissingNumbers(nameArray) {
  const presentNumbers = new Set();
  for (let char of nameArray) {
    const value = getValueInAlphabets(char);
    if (value > 0) {
      presentNumbers.add(value);
    }
  }
  
  const missingNumbers = [];
  for (let i = 1; i <= 9; i++) {
    if (!presentNumbers.has(i)) {
      missingNumbers.push({ value: i });
    }
  }
  return missingNumbers;
}

// Get rational thinking
function getRationalThinking(completedName, date) {
  const names = completedName.trim().split(' ').filter(name => name.length > 0);
  if (names.length === 0) return 0;
  
  const firstNameFirstLetter = names[0][0];
  const lastNameFirstLetter = names[names.length - 1][0];
  
  return sumAdjacent(
    getValueInAlphabets(firstNameFirstLetter) + 
    getValueInAlphabets(lastNameFirstLetter) + 
    Number(date)
  );
}

// Main numerology processing function
function processNumerology(fullName, birthDay) {
  const date = new Date(birthDay);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  const txtName = fullName.trim();
  const name = removeAccents(txtName.toUpperCase());
  
  // Clean up name by removing extra spaces
  let completedName = "";
  const arrStrName = name.split("");
  arrStrName.forEach((char, index) => {
    if ((char === " " && arrStrName[index + 1] !== " ") || char !== " ") {
      completedName += char;
    }
  });

  const arrName = name.replace(/\s/g, "").split("");

  // Calculate all numerology values
  const walksOfLife = getWalksOfLife(birthDay);
  const mission = getMission(name);
  const soul = getSoul(name);
  
  const resumWalksOfLife = String(walksOfLife).split("");
  const resumMission = String(mission).split("");
  const connect = Math.abs(
    sumAdjacent(resumWalksOfLife[0], resumWalksOfLife[1] || 0) -
    sumAdjacent(resumMission[0], resumMission[1] || 0)
  );
  
  const personality = getPersonality(arrName);
  const passion = getPassion(arrName);
  const mature = sumAdjacent(walksOfLife, mission, "mature");
  const balance = getBalance(completedName);
  const missingNumber = getMissingNumbers(arrName).map(item => item.value);
  const subconsciousPower = 9 - missingNumber.length;
  const rationalThinking = getRationalThinking(completedName, day);
  
  // Calculate ways
  const way1 = sumAdjacent(month, day);
  const way2 = sumAdjacent(year, day);
  const way3 = sumAdjacent(way1, way2);
  const way4 = sumAdjacent(month, year, "finalWay");
  const way = ` ${way1} ${way2} ${way3} ${way4}`;
  
  // Calculate challenges
  const challenge1 = substractAdjacent(month, day);
  const challenge2 = substractAdjacent(year, day);
  const challenge3 = Math.abs(challenge1 - challenge2);
  const challenge4 = substractAdjacent(month, year);
  const challenges = ` ${challenge1} ${challenge2} ${challenge3} ${challenge4}`;
  
  // Calculate individual years and months
  const yearIndividual = sumAdjacent(currentYear, day + month);
  const yearIndividual_1 = sumAdjacent(currentYear + 1, day + month);
  const yearIndividual_2 = sumAdjacent(currentYear + 2, day + month);
  
  const monthIndividual = sumAdjacent(yearIndividual, currentMonth);
  const monthIndividual_1 = sumAdjacent(
    currentMonth + 1 > 12 ? yearIndividual_1 : yearIndividual,
    ((currentMonth + 1 - 1) % 12) + 1
  );
  const monthIndividual_2 = sumAdjacent(
    currentMonth + 2 > 12 ? yearIndividual_1 : yearIndividual,
    ((currentMonth + 2 - 1) % 12) + 1
  );
  const monthIndividual_3 = sumAdjacent(
    currentMonth + 3 > 12 ? yearIndividual_1 : yearIndividual,
    ((currentMonth + 3 - 1) % 12) + 1
  );
  
  const linkPersonalityAndSoul = substractAdjacent(personality, soul);
  const dateOfBirth = sumAdjacent(day, 0);

  return [
    {
      key_duongdoi: "walksOfLife",
      value_duongdoi: walksOfLife,
      name_duongdoi: "Đường đời",
      name_en_duongdoi: "Path of life",
    },
    {
      key_sumenh: "mission",
      value_sumenh: mission,
      name_sumenh: "Sứ mệnh",
      name_en_sumenh: "Mission",
    },
    {
      key_linhhon: "soul",
      value_linhhon: soul,
      name_linhhon: "Linh hồn",
      name_en_linhhon: "Soul"
    },
    {
      key_ketnoi: "connect",
      value_ketnoi: connect,
      name_ketnoi: "Kết nối",
      name_en_ketnoi: "Connection",
    },
    {
      key_nhancach: "personality",
      value_nhancach: personality,
      name_nhancach: "Nhân cách",
      name_en_nhancach: "Personality",
    },
    {
      key_damme: "passion",
      value_damme: passion,
      name_damme: "Đam mê",
      name_en_damme: "Passion"
    },
    {
      key_truongthanh: "mature",
      value_truongthanh: mature,
      name_truongthanh: "Trưởng thành",
      name_en_truongthanh: "Mature",
    },
    {
      key_canbang: "balance",
      value_canbang: balance,
      name_canbang: "Cân bằng",
      name_en_canbang: "Balance",
    },
    {
      key_sucmanhtiemthuc: "subconsciousPower",
      value_sucmanhtiemthuc: subconsciousPower,
      name_sucmanhtiemthuc: "Sức mạnh tiềm thức",
      name_en_sucmanhtiemthuc: "Subconscious Power",
    },
    {
      key_sothieu: "missingNumbers",
      value_sothieu: missingNumber.toString().replace(/,/g, " "),
      name_sothieu: "Số thiếu",
      name_en_sothieu: "Missing Numbers",
    },
    {
      key_tuduylytri: "rationalThinking",
      value_tuduylytri: rationalThinking,
      name_tuduylytri: "Tư duy lý trí",
      name_en_tuduylytri: "Rational Thinking",
    },
    {
      key_chang: "way",
      value_chang: way,
      name_chang: "Chặng",
      name_en_chang: "Way",
    },
    {
      key_thachthuc: "challenges",
      value_thachthuc: challenges,
      name_thachthuc: "Thách thức",
      name_en_thachthuc: "Challenges",
    },
    {
      key_ngaysinh: "dateOfBirth",
      value_ngaysinh: dateOfBirth,
      name_ngaysinh: "Ngày sinh",
      name_en_ngaysinh: "Date Of Birth",
    },
    {
      key_namcanhan: "yearIndividual",
      value_namcanhan: yearIndividual,
      name_namcanhan: "Năm cá nhân",
      name_en_namcanhan: "Individual Year",
    },
    {
      key_namcanhan_1: "yearIndividual + 1",
      value_namcanhan_1: yearIndividual_1,
      name_namcanhan_1: "Năm cá nhân + 1",
      name_en_namcanhan_1: "Individual Year + 1",
    },
    {
      key_namcanhan_2: "yearIndividual + 2",
      value_namcanhan_2: yearIndividual_2,
      name_namcanhan_2: "Năm cá nhân + 2",
      name_en_namcanhan_2: "Individual Year + 2",
    },
    {
      key_thangcanhan: "monthIndividual",
      value_thangcanhan: monthIndividual,
      name_thangcanhan: "Tháng cá nhân",
      name_en_thangcanhan: "Individual Month",
    },
    {
      key_thangcanhan_1: "monthIndividual + 1",
      value_thangcanhan_1: monthIndividual_1,
      name_thangcanhan_1: "Tháng cá nhân + 1",
      name_en_thangcanhan_1: "Individual Month + 1",
    },
    {
      key_thangcanhan_2: "monthIndividual + 2",
      value_thangcanhan_2: monthIndividual_2,
      name_thangcanhan_2: "Tháng cá nhân + 2",
      name_en_thangcanhan_2: "Individual Month + 2",
    },
    {
      key_thangcanhan_3: "monthIndividual + 3",
      value_thangcanhan_3: monthIndividual_3,
      name_thangcanhan_3: "Tháng cá nhân + 3",
      name_en_thangcanhan_3: "Individual Month + 3",
    },
    {
      key_lienketnhancachvalinhhon: "linkPersonalityAndSoul",
      value_lienketnhancachvalinhhon: linkPersonalityAndSoul,
      name_lienketnhancachvalinhhon: "Liên kết nhân cách và linh hồn",
      name_en_lienketnhancachvalinhhon: "Link Personality And Soul",
    },
  ];
}

// Main n8n Code Function
// Expected input: { fullName: "string", birthDay: "YYYY-MM-DD" }
// Returns: Array of numerology calculations

const fullName = $input.first().json.fullName;
const birthDay = $input.first().json.birthDay;

if (!fullName || !birthDay) {
  throw new Error("fullName and birthDay are required");
}

const result = processNumerology(fullName, birthDay);

return [{ json: { numerology: result } }];
