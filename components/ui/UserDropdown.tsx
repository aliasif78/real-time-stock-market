'use client';

// Next Js
import { useRouter } from 'next/navigation';

// Shadcn
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from './button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Icons
import { LogOut } from 'lucide-react';

// Data
import NavItems from './NavItems';

const UserDropdown = () => {
  // Hooks
  const router = useRouter();

  // Functions
  const handleSignOut = async () => {
    router.push('/sign-in');
  };

  // Dummy Data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://via.placeholder.com/150',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-gray-4 flex items-center gap-3 hover:text-yellow-500">
          <Avatar className="size-8">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback className="bg-yellow-500 text-sm font-bold text-yellow-900">{user.name[0]}</AvatarFallback>
          </Avatar>

          <div className="hidden flex-col items-start md:flex">
            <span className="text-base font-medium text-gray-400">{user.name}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="text-gray-400">
        <DropdownMenuLabel>
          <div className="relative flex items-center gap-3 py-2">
            <Avatar className="size-10">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="bg-yellow-500 text-sm font-bold text-yellow-900">{user.name[0]}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <span className="text-base font-medium text-gray-400">{user.name}</span>
              <span className="text-sm text-gray-500">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-gray-600" />

        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-base font-medium text-gray-100 transition-colors focus:bg-transparent focus:text-yellow-500">
          <LogOut className="mr-2 hidden size-4 sm:block" />
          Logout
        </DropdownMenuItem>

        <DropdownMenuSeparator className="hidden bg-gray-600 sm:block" />

        <nav className="sm:hidden">
          <NavItems />
        </nav>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
