import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  employeeId?: string;
  profilePhotoUrl?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  tier: number;
  branding?: any;
  settings?: any;
  featureFlags?: any;
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if session exists in localStorage
    const savedUser = localStorage.getItem('hrms_user');
    const savedTenant = localStorage.getItem('hrms_tenant');
    if (savedUser && savedTenant) {
      setUser(JSON.parse(savedUser));
      setTenant(JSON.parse(savedTenant));
    } else {
      // Default mock login for instant demo experience
      const mockUser: User = {
        id: 'user-admin-uuid',
        email: 'admin@hrms.io',
        role: 'tenant_admin',
        firstName: 'Tariq',
        lastName: 'Imran',
        employeeId: 'emp-admin-uuid',
      };
      const mockTenant: Tenant = {
        id: 'tenant-uuid',
        name: 'R Solutions Pakistan',
        slug: 'r-solutions',
        tier: 1, // Tier 1 (Starter) default, stubs require upgrade
        featureFlags: { attendance: true, leaves: true, payroll: true, onboarding: true, letters: true, loans: true },
      };
      setUser(mockUser);
      setTenant(mockTenant);
      localStorage.setItem('hrms_user', JSON.stringify(mockUser));
      localStorage.setItem('hrms_tenant', JSON.stringify(mockTenant));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string): Promise<boolean> => {
    setIsLoading(true);
    // Dynamic Mock Login
    const namePart = email.split('@')[0];
    const firstName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const mockUser: User = {
      id: 'user-id',
      email,
      role: email.includes('admin') ? 'tenant_admin' : 'employee',
      firstName: firstName || 'Ayesha',
      lastName: 'Khan',
      employeeId: 'emp-id',
    };
    const mockTenant: Tenant = {
      id: 'tenant-uuid',
      name: 'R Solutions Pakistan',
      slug: 'r-solutions',
      tier: 1,
      featureFlags: { attendance: true, leaves: true, payroll: true, onboarding: true, letters: true, loans: true },
    };

    setUser(mockUser);
    setTenant(mockTenant);
    localStorage.setItem('hrms_user', JSON.stringify(mockUser));
    localStorage.setItem('hrms_tenant', JSON.stringify(mockTenant));
    setIsLoading(false);
    return true;
  };

  const register = async (data: any): Promise<boolean> => {
    setIsLoading(true);
    const mockUser: User = {
      id: 'user-new',
      email: data.email,
      role: 'tenant_admin',
      firstName: data.firstName,
      lastName: data.lastName,
    };
    const mockTenant: Tenant = {
      id: 'tenant-new',
      name: data.companyName,
      slug: data.companySlug,
      tier: 1,
      featureFlags: { attendance: true, leaves: true, payroll: true, onboarding: true, letters: true, loans: true },
    };

    setUser(mockUser);
    setTenant(mockTenant);
    localStorage.setItem('hrms_user', JSON.stringify(mockUser));
    localStorage.setItem('hrms_tenant', JSON.stringify(mockTenant));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    setTenant(null);
    localStorage.removeItem('hrms_user');
    localStorage.removeItem('hrms_tenant');
  };

  return (
    <AuthContext.Provider value={{ user, tenant, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
