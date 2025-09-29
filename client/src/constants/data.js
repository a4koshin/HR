import {
  LayoutDashboard,
  Users,
  Clock,
  DollarSign,
  UserPlus,
  GraduationCap,
  FileText,
  Settings,
  Activity,
  Building,
  Network,
  Briefcase,
  FolderTree,
} from "lucide-react";

export const navigation = [
  {
    id: 0,
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    id: 1,
    name: "Employees",
    icon: Users,
    path: "/employees",
  },
  {
    id: 7,
    name: "Departments",
    icon: Building, // Changed from Users to Building
    path: "/departments",
  },
  {
    id: 2,
    name: "Attendance",
    icon: Clock,
    path: "/attendance",
  },
  {
    id: 3,
    name: "Payroll",
    icon: DollarSign,
    path: "/payroll",
  },
  {
    id: 4,
    name: "Recruitment",
    icon: UserPlus,
    path: "/recruitment",
  },
  {
    id: 5,
    name: "Training",
    icon: GraduationCap,
    path: "/training",
  },
  {
    id: 6,
    name: "Documents",
    icon: FileText,
    path: "/documents",
  },
];