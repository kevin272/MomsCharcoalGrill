import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { NavLink, useNavigate } from 'react-router-dom'

const NAV = [
  { name: 'Admin', href: '/admin' },
  {name: 'Notices', href: '/admin/notices' },
  { name: 'Gallery', href: '/admin/gallery' },
  { name: 'Menu', href: '/admin/menu' },
  { name: 'Catering', href: '/admin/catering' },
  { name: 'Banner', href: '/admin/banners' },
  { name: 'Sauce', href: '/admin/sauces' },
  { name: 'Messages', href: '/admin/contact' },
  { name: 'Orders', href: '/admin/order' },
]

export default function AdminHeader() {
  const navigate = useNavigate()
  const signOut = () => { localStorage.removeItem('token'); navigate('/login', { replace:true }) }

  const linkBase = 'admin-header__link'
  const activeClass = 'admin-header__link admin-header__link--active'

  return (
    <Disclosure as="nav" className="admin-header">
      {({ close }) => (
        <>
          <div className="admin-header__inner">
            <div className="admin-header__bar">
              {/* Mobile trigger */}
              <div className="sm:hidden">
                {/* remove .admin-header__nav completely */}
{/* Mobile/desktop unified trigger */}
<DisclosureButton className="admin-header__trigger group">
  <span className="sr-only">=</span>
  <Bars3Icon className="block h-10 w-10 group-data-open:hidden outline-none" />
  <XMarkIcon className="hidden h-10 w-10 group-data-open:block" />
</DisclosureButton>


              </div>

              {/* Center nav */}
              <div className="admin-header__spacer">
                <div className="admin-header__nav">
                  {NAV.map((item) => (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      end={item.href === '/admin'}
                      className={({ isActive }) => (isActive ? activeClass : linkBase)}
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="admin-header__actions">
                <button className="btn--brand-outline" onClick={signOut}>
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Mobile panel */}
          <DisclosurePanel className="admin-header__panel sm:hidden">
            {NAV.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/admin'}
                className={({ isActive }) => (isActive ? activeClass : linkBase)}
                onClick={() => close()}
              >
                {item.name}
              </NavLink>
            ))}
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  )
}
