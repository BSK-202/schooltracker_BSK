import axios from 'axios';
//import API_BASE_URL from '../../config/baseUrl';
const API_BASE_URL ="https://2d416c32-26b2-48c4-b839-04421ac5a8c3.mock.pstmn.io"
export interface Student {
  id: number;
  fullName: string;
  qrCode: string;
  photoUrl: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  stop?: {
    id: number;
    address: string;
  };
  
  // Parents supprimés de l'interface principale
  // parents?: {
  //   parent1: {
  //     id: number;
  //     fullName: string;
  //     phone: string;
  //     photoUrl?: string;
  //   } | null;
  //   parent2: {
  //     id: number;
  //     fullName: string;
  //     phone: string;
  //     photoUrl?: string;
  //   } | null;
  // };
  
  // Pour l'affichage dans le tableau
  class?: string; // À ajouter si nécessaire
  status?: 'boarded' | 'absent' | 'waiting'; // Statut personnalisé
}

export interface CreateStudentData {
  fullName: string;
  photoUrl?: string;
  // parent1Id: number | null; // Supprimé
  // parent2Id?: number | null; // Supprimé
  stopId: number | null;
  photoFile?: File;
  class?: string;
}

export interface UpdateStudentData extends Partial<CreateStudentData> {
  id: number;
}

export interface StudentsResponse {
  success: boolean;
  data: Student[];
  meta: {
    total: number;
    page?: number;
    perPage?: number;
  };
}

class StudentService {
  private api = axios.create({
    baseURL: `${API_BASE_URL}/admin/students`,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  private formDataApi = axios.create({
    baseURL: `${API_BASE_URL}/admin/students`,
    timeout: 30000,
  });

  async getAllStudents(
    page = 1, 
    perPage = 10
  ): Promise<StudentsResponse> {
    const params: any = { page, perPage };
    
    const response = await this.api.get('', { params });
    return response.data;
  }

  async getStudentById(id: number) {
    const response = await this.api.get(`/${id}`);
    return response.data;
  }

  async createStudent(data: CreateStudentData) {
    // Si une photoFile est fournie, utiliser FormData
    if (data.photoFile) {
      const formData = new FormData();
      formData.append('fullName', data.fullName);
      
      // Supprimer les références aux parents
      // if (data.parent1Id) formData.append('parent1Id', data.parent1Id.toString());
      // if (data.parent2Id) formData.append('parent2Id', data.parent2Id.toString());
      
      if (data.stopId) formData.append('stopId', data.stopId.toString());
      if (data.class) formData.append('class', data.class);
      
      if (data.photoFile) {
        formData.append('photoFile', data.photoFile);
      } else if (data.photoUrl) {
        formData.append('photoUrl', data.photoUrl);
      }
      
      const response = await this.formDataApi.post('', formData);
      return response.data;
    } else {
      const requestData = {
        ...data,
        photoUrl: data.photoUrl
      };
      const response = await this.api.post('', requestData);
      return response.data;
    }
  }

  async updateStudent(id: number, data: UpdateStudentData) {
    // Si une photoFile est fournie, utiliser FormData
    if (data.photoFile) {
      const formData = new FormData();
      formData.append('fullName', data.fullName || '');
      
      // Supprimer les références aux parents
      // if (data.parent1Id !== undefined) formData.append('parent1Id', data.parent1Id?.toString() || '');
      // if (data.parent2Id !== undefined) formData.append('parent2Id', data.parent2Id?.toString() || '');
      
      if (data.stopId !== undefined) formData.append('stopId', data.stopId?.toString() || '');
      if (data.class) formData.append('class', data.class);
      
      if (data.photoFile) {
        formData.append('photoFile', data.photoFile);
      } else if (data.photoUrl) {
        formData.append('photoUrl', data.photoUrl || '');
      }
      
      const response = await this.formDataApi.put(`/${id}`, formData);
      return response.data;
    } else {
      const requestData = {
        ...data,
        photoUrl: data.photoUrl
      };
      const response = await this.api.put(`/${id}`, requestData);
      return response.data;
    }
  }

  async deleteStudent(id: number) {
    const response = await this.api.delete(`/${id}`);
    return response.data;
  }

  async searchStudents(query: string, page = 1, perPage = 10) {
    const params = { q: query, page, perPage };
    const response = await this.api.get('/search', { params });
    return response.data;
  }

  // Méthodes pour les statuts
  async markAsBoarded(studentId: number) {
    const response = await this.api.post(`/${studentId}/boarded`);
    return response.data;
  }

  async markAsAbsent(studentId: number) {
    const response = await this.api.post(`/${studentId}/absent`);
    return response.data;
  }

  async getAttendanceStats() {
    const response = await this.api.get('/stats/attendance');
    return response.data;
  }
}

export default new StudentService();
