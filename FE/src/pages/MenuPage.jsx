import Breadcrumb from '../components/CateringHero'
import MenuImageSection, { DownloadMenuButton } from '../components/MenuImageSection'

function MenuPage() {
  return (
    <div className="menu-page">

      {/* Breadcrumb with title + play icon */}
      <Breadcrumb title="MENU" backgroundImage="/MENU BANNER.jpg">
      </Breadcrumb>

      <MenuImageSection />
      <DownloadMenuButton />
    </div>
  )
}

export default MenuPage
