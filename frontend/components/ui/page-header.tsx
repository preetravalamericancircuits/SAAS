import { ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, action }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((item, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2" />
                )}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-sm text-gray-900 dark:text-white font-medium">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}