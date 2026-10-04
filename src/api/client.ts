// API Base URL — website ka local IP
export const API_BASE_URL = "https://the-legends-academy-school-system.vercel.app";

// ─────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  // ✅ Logging add ki
  console.log(`📤 ${options?.method || "GET"} ${url}`);
  if (options?.body) {
    console.log(`📦 Body:`, options.body);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    // ✅ Response logging
    console.log(`📥 Response status: ${response.status}`);

    const text = await response.text();
    console.log(`📥 Response body:`, text);

    if (!text) throw new Error(`Empty response from ${path}`);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON from ${path}`);
    }

    if (!response.ok) {
      throw new Error(data.error || `Request failed: ${response.status}`);
    }

    return data;
  } catch (err) {
    console.error(`❌ API error [${path}]:`, err);
    throw err;
  }
}

// ─────────────────────────────────────────
// STUDENTS
// ─────────────────────────────────────────

export type Student = {
  id: string;
  studentId: string;
  admissionNumber: string;
  fullName: string;
  fatherName: string | null;
  gender: string | null;
  rollNumber: string | null;
  contactNumber: string | null;
  address: string | null;
  status: string;
};

export const studentsApi = {
  list: () => apiFetch<Student[]>("/api/students"),

  create: (data: Partial<Student>) =>
    apiFetch<Student>("/api/students", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (data: Partial<Student> & { id: string }) =>
    apiFetch<Student>("/api/students", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>("/api/students", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    }),
};

// ─────────────────────────────────────────
// TEACHERS
// ─────────────────────────────────────────

export type Teacher = {
  id: string;
  teacherId: string;
  name: string;
  qualification: string | null;
  contactNumber: string | null;
  email: string | null;
  address: string | null;
  joiningDate: string | null;
  employmentStatus: string;
};

export const teachersApi = {
  list: async () => {
    const res = await apiFetch<{ teachers: Teacher[] }>("/api/teachers");
    return res.teachers || [];
  },

  create: (data: Partial<Teacher>) =>
    apiFetch<{ teacher: Teacher }>("/api/teachers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (data: Partial<Teacher> & { id: string }) =>
    apiFetch<{ teacher: Teacher }>("/api/teachers", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>("/api/teachers", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    }),
};

// ─────────────────────────────────────────
// CLASSES
// ─────────────────────────────────────────

export type ClassRoom = {
  id: string;
  name: string;
  code: string | null;
  classTeacherId: string | null;
};

export const classesApi = {
  list: async () => {
    const res = await apiFetch<any>("/api/classes");
    if (Array.isArray(res)) return res as ClassRoom[];
    return (res.classes || []) as ClassRoom[];
  },

  create: (data: Partial<ClassRoom>) =>
    apiFetch<ClassRoom>("/api/classes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>("/api/classes", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    }),
};

// ─────────────────────────────────────────
// SUBJECTS
// ─────────────────────────────────────────

export type Subject = {
  id: string;
  name: string;
  code: string | null;
  totalMarks: number;
  passingMarks: number;
};

export const subjectsApi = {
  list: async () => {
    const res = await apiFetch<{ subjects: Subject[] }>("/api/subjects");
    return res.subjects || [];
  },

  create: (data: Partial<Subject>) =>
    apiFetch<{ subject: Subject }>("/api/subjects", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Subject>) =>
    apiFetch<{ subject: Subject }>(`/api/subjects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/api/subjects/${id}`, {
      method: "DELETE",
    }),
};

// ─────────────────────────────────────────
// ATTENDANCE
// ─────────────────────────────────────────

export type AttendanceRecord = {
  id: string;
  studentId: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "LEAVE";
  remarks: string | null;
  student: {
    id: string;
    studentId: string;
    fullName: string;
    rollNumber: string | null;
  };
};

export const attendanceApi = {
  list: async (date?: string) => {
    const query = date ? `?date=${date}` : "";
    const res = await apiFetch<{ attendance: AttendanceRecord[] }>(
      `/api/attendance${query}`
    );
    return res.attendance || [];
  },

  mark: (data: {
    studentId: string;
    date: string;
    status: string;
    remarks?: string;
  }) =>
    apiFetch<{ attendance: AttendanceRecord; message: string }>(
      "/api/attendance",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),
};

// ─────────────────────────────────────────
// TESTS / EXAMS
// ─────────────────────────────────────────

export type Test = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  totalMarks: number;
  passingMarks: number;
  testDate: string;
  isPublished: boolean;
  classRoom?: { name: string } | null;
  subject?: { name: string } | null;
  teacher?: { name: string } | null;
};

export const examsApi = {
  list: () => apiFetch<Test[]>("/api/tests"),

  create: (data: any) =>
    apiFetch<Test>("/api/tests", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─────────────────────────────────────────
// FEE TYPES
// ─────────────────────────────────────────

export type FeeType = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

export const feeTypesApi = {
  list: () => apiFetch<FeeType[]>("/api/fee-types"),

  create: (data: Partial<FeeType>) =>
    apiFetch<FeeType>("/api/fee-types", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<FeeType>) =>
    apiFetch<FeeType>("/api/fee-types", {
      method: "PUT",
      body: JSON.stringify({ id, ...data }),
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>("/api/fee-types", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    }),
};

// ─────────────────────────────────────────
// FEE REPORTS
// ─────────────────────────────────────────

export type FeeSummary = {
  totalBilled: number;
  totalCollected: number;
  totalRemaining: number;
  paidCount: number;
  partialCount: number;
  unpaidCount: number;
  overdueCount: number;
};

export const feeReportsApi = {
  get: () =>
    apiFetch<{
      success: boolean;
      summary: FeeSummary;
      count: number;
      vouchers: any[];
    }>("/api/fee-reports"),
};