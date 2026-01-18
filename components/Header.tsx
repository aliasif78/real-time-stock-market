// Next Js
import Link from 'next/link';
import Image from 'next/image';

// Components
import NavItems from './NavItems';
import UserDropdown from './UserDropdown';

const Header = ({ user }: { user: User | null }) => {
  return (
    <header className="header sticky top-0">
      <div className="header-wrapper container">
        <Link href="/">
          <Image src="/assets/icons/logo.svg" alt="Signalist Logo" width={140} height={140} />
        </Link>

        <nav className="hidden sm:block">
          <NavItems />
        </nav>

        <UserDropdown user={user} />
      </div>
    </header>
  );
};

export default Header;
