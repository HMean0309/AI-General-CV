import { create } from 'zustand';

const initialCvData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    linkedIn: '',
    github: '',
  },
  professionalSummary: '',
  technicalSkills: [],
  relevantCoursework: [],
  projects: [],
  education: {
    school: 'Trường Đại học Tây Đô',
    major: '',
    gpa: '',
    graduationYear: '',
  },
};

const useCvStore = create((set, get) => ({
  // --- Trạng thái workspace ---
  workspaceState: 'input', // 'input' | 'processing' | 'editing'

  // --- Đầu vào ---
  targetRole: '',
  jobDescription: '',
  emphasizeProjects: false,

  // --- Kết quả từ AI ---
  cvData: { ...initialCvData },
  matchScore: 0,
  missingKeywords: [],
  scoreBreakdown: null,
  processingSteps: [],

  // --- Template ---
  selectedTemplate: 'modern', // 'modern' | 'classic' | 'creative'

  // === Actions ===

  // Cập nhật đầu vào
  setTargetRole: (role) => set({ targetRole: role }),
  setJobDescription: (jd) => set({ jobDescription: jd }),
  setEmphasizeProjects: (val) => set({ emphasizeProjects: val }),

  // Chuyển trạng thái
  setWorkspaceState: (state) => set({ workspaceState: state }),

  // Bắt đầu xử lý AI
  startProcessing: () =>
    set({
      workspaceState: 'processing',
      processingSteps: [
        { label: 'Đang phân tích Job Description...', done: false },
        { label: 'Đang trích xuất hồ sơ năng lực...', done: false },
        { label: 'Đang so khớp từ khóa ngữ nghĩa...', done: false },
        { label: 'Đang biên soạn nội dung CV...', done: false },
        { label: 'Đang tối ưu hóa cho ATS...', done: false },
      ],
    }),

  // Cập nhật tiến độ processing
  updateProcessingStep: (index) =>
    set((state) => {
      const steps = [...state.processingSteps];
      if (steps[index]) steps[index].done = true;
      return { processingSteps: steps };
    }),

  // Nhận kết quả từ AI
  setCvResult: (data) =>
    set({
      workspaceState: 'editing',
      cvData: data.cvData || initialCvData,
      matchScore: data.matchScore || 0,
      missingKeywords: data.missingKeywords || [],
      scoreBreakdown: data.scoreBreakdown || null,
    }),

  // Cập nhật 1 field trong CV data (real-time sync)
  updateCvField: (path, value) =>
    set((state) => {
      const newData = { ...state.cvData };
      const keys = path.split('.');
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (current[keys[i]] !== undefined) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }
      }
      current[keys[keys.length - 1]] = value;
      return { cvData: newData };
    }),

  // Cập nhật toàn bộ CV data
  setCvData: (data) => set({ cvData: data }),

  // Chọn template
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),

  // Reset toàn bộ
  resetWorkspace: () =>
    set({
      workspaceState: 'input',
      targetRole: '',
      jobDescription: '',
      emphasizeProjects: false,
      cvData: { ...initialCvData },
      matchScore: 0,
      missingKeywords: [],
      scoreBreakdown: null,
      processingSteps: [],
    }),
}));

export default useCvStore;
