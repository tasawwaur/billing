import { Customer } from "@/types/customer";

const firstNames = [
  "Rahul", "Priya", "Amitav", "Sana", "Vikram", "Ananya", "Devraj", "Meera", "Kabir", "Rohan",
  "Nisha", "Arjun", "Aditi", "Karan", "Simran", "Siddharth", "Tanya", "Yash", "Ishita", "Tarun",
  "Sneha", "Aditya", "Rhea", "Manish", "Divya", "Gaurav", "Pooja", "Varun", "Kavya", "Aakash",
  "Nitin", "Shweta", "Rajesh", "Sunita", "Sanjay", "Ritu", "Deepak", "Monika", "Alok", "Richa"
];

const lastNames = [
  "Sharma", "Sengupta", "Roy", "Khan", "Malhotra", "Birla", "Kapoor", "Joshi", "Singhania", "Chawla",
  "Verma", "Mehta", "Deshmukh", "Gupta", "Bansal", "Chopra", "Nair", "Iyer", "Rao", "Patel",
  "Agarwal", "Reddy", "Trivedi", "Mishra", "Pandey", "Dutta", "Mukherjee", "Saxena", "Bhatia", "Walia"
];

const generateCustomers = (): Customer[] => {
  const list: Customer[] = [
    { id: "cust-1", name: "Rahul Sharma", phone: "+91 98765 43210", email: "rahul.sharma@example.com", address: "Altamount Road, Mumbai", gstin: "27AABCU9603R1ZM", totalBills: 14, totalSpent: 142500, dueBalance: 0, createdAt: "2025-11-10" },
    { id: "cust-2", name: "Amitav Roy", phone: "+91 98310 12345", email: "amitav.roy@example.com", address: "Ballygunge Circular Rd, Kolkata", gstin: "19AAACR1234F1Z2", totalBills: 8, totalSpent: 86400, dueBalance: 1280, createdAt: "2025-11-15" },
    { id: "cust-3", name: "Sana Khan", phone: "+91 98111 98765", email: "sana.k@example.com", address: "Golf Links, New Delhi", gstin: "07AAACK5678G1Z9", totalBills: 22, totalSpent: 218000, dueBalance: 0, createdAt: "2025-11-20" },
    { id: "cust-4", name: "Priya Sengupta", phone: "+91 97480 55443", email: "priya.s@example.com", address: "Alipore, Kolkata", totalBills: 5, totalSpent: 42000, dueBalance: 3800, createdAt: "2025-12-01" },
    { id: "cust-5", name: "Vikram Malhotra", phone: "+91 98200 11223", email: "vikram.m@example.com", address: "Juhu Scheme, Mumbai", gstin: "27AAACM9988H1Z1", totalBills: 19, totalSpent: 310500, dueBalance: 8500, createdAt: "2025-12-05" },
    { id: "cust-6", name: "Ananya Birla", phone: "+91 98210 44332", email: "ananya.b@example.com", address: "Worli Sea Face, Mumbai", totalBills: 11, totalSpent: 195000, dueBalance: 4870, createdAt: "2025-12-10" },
  ];

  let count = list.length + 1;
  while (list.length < 126) {
    const fn = firstNames[(count * 3) % firstNames.length];
    const ln = lastNames[(count * 7) % lastNames.length];
    const name = `${fn} ${ln}`;
    const phone = `+91 ${98000 + (count * 123) % 19999} ${10000 + (count * 456) % 89999}`;
    const totalSpent = Math.round((5000 + (count * 3700) % 180000) / 100) * 100;
    const dueBalance = (count % 11 === 0) ? Math.round((800 + (count * 450) % 5000) / 50) * 50 : 0;
    
    list.push({
      id: `cust-${count}`,
      name,
      phone,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
      address: `${10 + (count % 80)}, Luxury Enclave, City`,
      gstin: (count % 3 === 0) ? `27ABCDE${1000 + count}F1Z5` : undefined,
      totalBills: 1 + (count % 15),
      totalSpent,
      dueBalance,
      createdAt: `2026-01-${String(1 + (count % 28)).padStart(2, '0')}`,
    });
    count++;
  }

  return list;
};

export const INITIAL_CUSTOMERS: Customer[] = generateCustomers();
