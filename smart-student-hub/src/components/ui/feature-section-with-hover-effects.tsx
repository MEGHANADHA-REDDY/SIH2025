import { cn } from "@/lib/utils";
import {
  IconChartBar,
  IconUpload,
  IconShield,
  IconDownload,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "Dynamic Dashboard",
      description:
        "Track performance, attendance, and credits at a glance.",
      icon: <IconChartBar />,
    },
    {
      title: "Activity Tracker",
      description:
        "Upload and validate seminars, MOOCs, internships, and more.",
      icon: <IconUpload />,
    },
    {
      title: "Faculty Approval",
      description:
        "Keep records verified and credible with faculty reviews.",
      icon: <IconShield />,
    },
    {
      title: "Digital Portfolio",
      description: "Auto-generated, downloadable, and shareable verified student portfolio in PDF or web link format",
      icon: <IconDownload />,
    },
    {
      title: "Analytics & Reporting",
      description: "Generate reports for NAAC, AICTE, NIRF, or internal evaluations with comprehensive data insights",
      icon: <IconTrendingUp />,
    },
    {
      title: "Integration Support",
      description:
        "Seamlessly link with existing Learning Management Systems (LMS), ERP, or digital university platforms",
      icon: <IconUsers />,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature border-gray-200",
        (index === 0 || index === 3) && "lg:border-l border-gray-200",
        index < 3 && "lg:border-b border-gray-200"
      )}
    >
      {index < 3 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-blue-50 to-transparent pointer-events-none" />
      )}
      {index >= 3 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-blue-50 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-blue-600">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-gray-300 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-gray-900">
          {title}
        </span>
      </div>
      <p className="text-sm text-gray-700 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
