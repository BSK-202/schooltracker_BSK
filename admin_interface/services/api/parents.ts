
import axios from 'axios';
import API_BASE_URL from '../../config/baseUrl';

export interface Parent {
  id: number;
  fullName: string;           // Note: camelCase (fullName) au lieu de full_name
  phone: string;
  sexe: boolean; // true = male, false = female
  photoUrl: string;           // Note: photoUrl au lieu de photo
  createdAt: string;          // Note: createdAt au lieu de created_at
  updatedAt: string;          // Note: updatedAt au lieu de updated_at
  totalChildren?: number;
}

export interface CreateParentData {
  fullName: string;           // Note: camelCase
  phone: string;
  password: string;
  sexe: boolean;
  photoUrl?: string;          // Note: camelCase
  photoFile?: File;
}

export interface UpdateParentData extends Partial<CreateParentData> {
  currentPassword?: string;
  newPassword?: string;
}

export interface ParentsResponse {
  success: boolean;
  data: Parent[];
  meta: {
    total: number;
    page?: number;
    perPage?: number;
  };
}

class ParentService {
  private api = axios.create({
    baseURL: `${API_BASE_URL}/admin/parents`,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  private formDataApi = axios.create({
    baseURL: `${API_BASE_URL}/admin/parents`,
    timeout: 30000,
  });

  async getAllParents(
    page = 1, 
    perPage = 10
  ): Promise<ParentsResponse> {
    const params: any = { page, perPage };
    
    const response = await this.api.get('', { params });
    return response.data;
  }

  async getParentById(id: number) {
    const response = await this.api.get(`/${id}`);
    return response.data;
  }

  async createParent(data: CreateParentData) {
    // Si une photoFile est fournie, utiliser FormData
    if (data.photoFile) {
      const formData = new FormData();
      formData.append('fullName', data.fullName);
      formData.append('phone', data.phone);
      formData.append('password', data.password);
      formData.append('sexe', data.sexe.toString());
      formData.append('photoFile', data.photoFile);
      
      const response = await this.formDataApi.post('', formData);
      return response.data;
    } else {
      // Convertir photoUrl en photoUrl pour le backend
      const requestData = {
        ...data,
        photoUrl: data.photoUrl
      };
      const response = await this.api.post('', requestData);
      return response.data;
    }
  }

  async updateParent(id: number, data: UpdateParentData) {
    // Si une photoFile est fournie, utiliser FormData
    if (data.photoFile) {
      const formData = new FormData();
      formData.append('fullName', data.fullName || '');
      formData.append('phone', data.phone || '');
      formData.append('sexe', data.sexe?.toString() || '');
      
      if (data.password) {
        formData.append('password', data.password);
      }
      
      formData.append('photoFile', data.photoFile);
      
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

  async deleteParent(id: number) {
    const response = await this.api.delete(`/${id}`);
    return response.data;
  }

  async searchParents(query: string, page = 1, perPage = 10) {
    const params = { q: query, page, perPage };
    const response = await this.api.get('/search', { params });
    return response.data;
  }
}

export default new ParentService();
