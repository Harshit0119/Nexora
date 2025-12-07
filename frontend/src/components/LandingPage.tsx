import { useState, useRef, useEffect } from "react";
import {
  Building2,
  GraduationCap,
  Shield,
  Users,
  Sparkles,
  ArrowRight,
  Check,
  Upload,
  FileSpreadsheet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type InstituteType = "school" | "college" | "university" | "training_center";

interface Institute {
  id: string;
  name: string;
  email: string;
  type: InstituteType;
  departments: string[];
}


type Role = "admin" | "faculty" | "director" | null;

const instituteTypes: { value: InstituteType; label: string }[] = [
  { value: "school", label: "School" },
  { value: "college", label: "College" },
  { value: "university", label: "University" },
  { value: "training_center", label: "Training Center" },
];

const roles = [
  {
    id: "admin",
    label: "Admin",
    icon: Shield,
    description: "Full access to institute management",
  },
  {
    id: "faculty",
    label: "faculty",
    icon: Users,
    description: "Manage there individual timetable",
  },
  {
    id: "director",
    label: "Director",
    icon: GraduationCap,
    description:
      "Can see fauclty and all departments timeatbale and manage them",
  },
];

const API_BASE = "https://nexora-6qdg.onrender.com";

const LandingPage = () => {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [selectedInstitute, setSelectedInstitute] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    type: "" as InstituteType | "",
  });
  const [departments, setDepartments] = useState<string[]>([]);
  const [csvFileName, setCsvFileName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
    const fetchInstitutes = async () => {
      const res = await fetch("api_base/institutes");
      const data = await res.json();
      setInstitutes(data);
    };
    fetchInstitutes();
  }, []);

  useEffect(() => {
    if (!selectedInstitute) return;
    const fetchDepartments = async () => {
      const res = await fetch(
        `api_base/departments?institute_id=${selectedInstitute}`
      );
      const data = await res.json();
      setDepartments(data.map((d: any) => d.name));
    };
    fetchDepartments();
  }, [selectedInstitute]);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    setCsvFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line);
      // Skip header if it contains "department" (case insensitive)
      const startIndex = lines[0]?.toLowerCase().includes("department") ? 1 : 0;
      const depts = lines.slice(startIndex).filter((dept) => dept.length > 0);
      setDepartments(depts);
      toast.success(`${depts.length} departments loaded from CSV`);
    };
    reader.readAsText(file);
  };

  const clearCsvUpload = () => {
    setDepartments([]);
    setCsvFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const requiresDepartments = formData.type && formData.type !== "school";

  const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.name || !formData.email || !formData.password || !formData.type) {
    toast.error("Please fill in all fields");
    return;
  }

  if (requiresDepartments && departments.length === 0) {
    toast.error("Please upload a CSV file with departments");
    return;
  }

  setIsSubmitting(true);

  try {
    // Register institute
    const res = await fetch("api_base/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        type: formData.type,
      }),
    });
    const { data } = await res.json();
    const instituteId = data[0].id;

    // Upload CSV if needed
    if (requiresDepartments && fileInputRef.current?.files?.[0]) {
      const formDataUpload = new FormData();
      formDataUpload.append("file", fileInputRef.current.files[0]);
      await fetch(`api_base/upload/${instituteId}`, {
        method: "POST",
        body: formDataUpload,
      });
    }

    // Refresh institutes list
    const listRes = await fetch("api_base/institutes");
    const listData = await listRes.json();
    setInstitutes(listData);

    toast.success(`${formData.name} registered successfully!`);
  } catch (err) {
    toast.error("Error registering institute");
  } finally {
    setIsSubmitting(false);
    setFormData({ name: "", email: "", password: "", type: "" });
    setDepartments([]);
    setCsvFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }
};

  const currentInstitute = institutes.find((i) => i.id === selectedInstitute);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-glow delay-300" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              {/* Replace SVG with your logo */}
              <img src="icon.ico" alt="Nexora Logo" className="w-40 h-25" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">
              Nexora
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#register"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Register
            </a>
            <a
              href="#access"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Access
            </a>
          </div>
          <Button
            variant="outline"
            className="border-primary/50 text-primary hover:bg-primary/10"
          >
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI-Powered Institute Management
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight">
              Empowering Institutes with
              <span className="block gradient-text">AI-driven Workflows</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Nexora revolutionizes institute management with intelligent
              automation, role-based collaboration, and seamless workflows that
              adapt to your needs.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold px-8 py-6 text-lg glow-hover transition-all duration-300"
                onClick={() =>
                  document
                    .getElementById("register")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-border hover:bg-secondary/50 px-8 py-6 text-lg"
              >
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            {[
              {
                icon: Building2,
                title: "Multi-Institute Support",
                desc: "Manage multiple institutes from a single dashboard",
              },
              {
                icon: Shield,
                title: "Role-Based Access",
                desc: "Granular permissions for admins, facultys, and directors",
              },
              {
                icon: Sparkles,
                title: "AI Automation",
                desc: "Smart workflows that learn and adapt to your processes",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className={`glass-card p-6 hover:border-primary/30 transition-all duration-300 glow-hover animate-slide-up opacity-0`}
                style={{
                  animationDelay: `${(i + 1) * 150}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="register" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div
              className="space-y-6 animate-slide-up opacity-0"
              style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold">
                Register Your <span className="gradient-text">Institute</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Join thousands of institutes already using Nexora to streamline
                their operations and enhance collaboration.
              </p>
              <ul className="space-y-3">
                {["Instant setup", "Free trial available", "24/7 support"].map(
                  (item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-muted-foreground"
                    >
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Registration Form */}
            <div
              className="glass-card p-8 glow animate-slide-up opacity-0"
              style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
            >
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Institute Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter institute name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-secondary/50 border-border focus:border-primary focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-foreground">
                    Institute Type
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(val: InstituteType) => {
                      setFormData({ ...formData, type: val });
                      if (val === "school") {
                        clearCsvUpload();
                      }
                    }}
                  >
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue placeholder="Select institute type" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {instituteTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {requiresDepartments && (
                  <div className="space-y-2 animate-fade-in">
                    <Label className="text-foreground">
                      Departments (CSV Upload)
                    </Label>
                    <div className="p-3 bg-secondary/50 rounded-lg border border-border mb-2">
                      <p className="text-xs text-muted-foreground mb-1">
                        <span className="font-medium text-foreground">
                          CSV Format:
                        </span>{" "}
                        Single column with header "Department"
                      </p>
                      <code className="block text-xs bg-background/50 p-2 rounded font-mono text-primary">
                        Department
                        <br />
                        Computer Science
                        <br />
                        Electrical and communication eng.
                        <br />
                        Mechanicl Engineering
                      </code>
                    </div>
                    <div className="relative">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleCsvUpload}
                        className="hidden"
                        id="csv-upload"
                      />
                      {!csvFileName ? (
                        <label
                          htmlFor="csv-upload"
                          className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                        >
                          <Upload className="w-6 h-6 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Click to upload departments CSV
                          </span>
                        </label>
                      ) : (
                        <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/30 rounded-xl">
                          <div className="flex items-center gap-3">
                            <FileSpreadsheet className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {csvFileName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {departments.length} departments loaded
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={clearCsvUpload}
                            className="p-1 hover:bg-destructive/20 rounded-md transition-colors"
                          >
                            <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      )}
                    </div>
                    {departments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {departments.slice(0, 5).map((dept, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs bg-secondary rounded-md text-muted-foreground"
                          >
                            {dept}
                          </span>
                        ))}
                        {departments.length > 5 && (
                          <span className="px-2 py-1 text-xs bg-secondary rounded-md text-primary">
                            +{departments.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@institute.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="bg-secondary/50 border-border focus:border-primary focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a secure password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="bg-secondary/50 border-border focus:border-primary focus:ring-primary/20"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold py-6 text-lg transition-all duration-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Registering...
                    </span>
                  ) : (
                    <>
                      Register Institute <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              {institutes.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">
                    {institutes.length} institute
                    {institutes.length > 1 ? "s" : ""} registered
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Access Section */}
      <section id="access" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div
            className="text-center space-y-4 mb-12 animate-slide-up opacity-0"
            style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Access Your <span className="gradient-text">Dashboard</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Select your institute and role to access the personalized
              dashboard
            </p>
          </div>

          <div
            className="glass-card p-8 space-y-8 animate-slide-up opacity-0"
            style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
          >
            {/* Institute Selection */}
            <div className="space-y-3">
              <Label className="text-foreground text-lg">
                Select Institute
              </Label>
              <Select
                value={selectedInstitute}
                onValueChange={(val) => {
                  setSelectedInstitute(val);
                  setSelectedRole(null);
                }}
              >
                <SelectTrigger className="bg-secondary/50 border-border h-14 text-lg">
                  <SelectValue placeholder="Choose an institute" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {institutes.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No institutes registered yet
                    </div>
                  ) : (
                    institutes.map((inst) => (
                      <SelectItem
                        key={inst.id}
                        value={inst.id}
                        className="py-3"
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-primary" />
                          <span>{inst.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Role Selection */}
            {selectedInstitute && (
              <div className="space-y-4 animate-fade-in">
                <Label className="text-foreground text-lg">
                  Select Your Role
                </Label>
                <div className="grid md:grid-cols-3 gap-4">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id as Role)}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                        selectedRole === role.id
                          ? "border-primary bg-primary/10 glow"
                          : "border-border hover:border-primary/50 bg-secondary/30"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                          selectedRole === role.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <role.icon className="w-6 h-6" />
                      </div>
                      <h4 className="font-display font-semibold text-foreground mb-1">
                        {role.label}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {role.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dashboard Preview */}
            {selectedInstitute && selectedRole && currentInstitute && (
              <div className="animate-fade-in">
                <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-8 border border-primary/20 glow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-bold text-foreground">
                        Welcome to Nexora
                      </h3>
                      <p className="text-primary font-medium">
                        {currentInstitute.name} — Role:{" "}
                        {roles.find((r) => r.id === selectedRole)?.label}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Your personalized dashboard is ready. Access courses, manage
                    users, and leverage AI-powered tools to enhance your
                    institute's productivity.
                  </p>
                  <Button className="mt-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold">
                    Enter Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold text-foreground">
                Nexora
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 Nexora. Empowering education through AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
