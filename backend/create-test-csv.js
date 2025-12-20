// create-test-csv.js
const fs = require('fs');

const csvContent = `question,option1,option2,option3,option4,correct_option,explanation,difficulty,category,points,time_limit
"What is React?","JavaScript library","CSS framework","Database","Operating System",1,"React is a JS library for building UIs","easy","Web Development",10,30
"What is MongoDB?","Relational DB","NoSQL DB","Graph DB","Time-series DB",2,"MongoDB is a document-based NoSQL database","medium","Database",15,45
"What is Node.js?","Frontend framework","Runtime environment","Database","Text editor",2,"Node.js is a JavaScript runtime built on Chrome's V8 engine","easy","Backend",10,30
"What does API stand for?","Application Programming Interface","Advanced Programming Interface","Application Process Integration","Automated Programming Interface",1,"API allows different software applications to communicate","easy","General",10,30
"What is HTTP?","HyperText Transfer Protocol","HighText Transfer Protocol","HyperTransfer Text Protocol","HighTransfer Text Protocol",1,"HTTP is the foundation of data communication on the web","easy","Web",10,30`;

fs.writeFileSync('test_questions.csv', csvContent);
console.log('✅ Created test_questions.csv with 5 sample questions');
console.log('📋 First question: "What is React?"');
console.log('📋 Upload command: curl -X POST http://localhost:5000/api/admin/upload-questions -F "csvFile=@test_questions.csv" -F "event=InnovWEB"');