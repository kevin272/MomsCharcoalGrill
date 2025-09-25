import React from 'react'
import { Link } from 'react-router-dom'

const CateringOptionCard = ({ image, minPeople, optionTitle, description, linkTo }) => {
  return (
    <div className="catering-option-card">
      <div className="catering-option-image">
        <img src={image} alt="Catering option" />
      </div>
      <div className="catering-option-content">
        <p className="catering-min-people">{minPeople}</p>
        <h3 className="catering-option-title">{optionTitle}</h3>
        <p className="catering-option-description">{description}</p>
        {linkTo ? (
          <Link to={linkTo} className="catering-view-menu-btn">VIEW FULL MENU</Link>
        ) : (
          <button className="catering-view-menu-btn">VIEW FULL MENU</button>
        )}
      </div>
    </div>
  )
}

const CateringOptions = () => {
  const options = [
    {
      image: "https://api.builder.io/api/v1/image/assets/TEMP/e5104aca6d5bec1e7893cef875a030addc065fda?width=573",
      minPeople: "Minimum 20 People",
      optionTitle: "HOT DISHES ($160.00 per tray)",
      description: "Chicken, Salad (Potato, Pumpkin, Greek or Asian), Bread Rolls, Veggies (Potato, Pumpkin, Greek or Asian)",
      linkTo: "/catering/hot-dishes"
    },
    {
      image: "https://api.builder.io/api/v1/image/assets/TEMP/996d39c0b51d5765d66f6e3fcdc088212af2611f?width=573",
      minPeople: "Minimum 20 People",
      optionTitle: "OPTION 1 ($25.90 per person)",
      description: "Chicken, Salad (Potato, Pumpkin, Greek or Asian), Bread Rolls, Veggies (Potato, Pumpkin, Greek or Asian)"
    },
    {
      image: "https://api.builder.io/api/v1/image/assets/TEMP/88e90b2348d48f0f02232f4569057214b9bfc79c?width=573",
      minPeople: "Minimum 20 People",
      optionTitle: "OPTION 1 ($25.90 per person)",
      description: "Chicken, Salad (Potato, Pumpkin, Greek or Asian), Bread Rolls, Veggies (Potato, Pumpkin, Greek or Asian)"
    },
    {
      image: "https://api.builder.io/api/v1/image/assets/TEMP/864ceb5270d5f263f7ec9814cc282632d705588c?width=573",
      minPeople: "Minimum 20 People",
      optionTitle: "OPTION 1 ($25.90 per person)",
      description: "Chicken, Salad (Potato, Pumpkin, Greek or Asian), Bread Rolls, Veggies (Potato, Pumpkin, Greek or Asian)"
    },
    {
      image: "https://api.builder.io/api/v1/image/assets/TEMP/2888cbdbf8c0445a514c6db5c0a9ff3a548070d2?width=573",
      minPeople: "Minimum 20 People",
      optionTitle: "OPTION 1 ($25.90 per person)",
      description: "Chicken, Salad (Potato, Pumpkin, Greek or Asian), Bread Rolls, Veggies (Potato, Pumpkin, Greek or Asian)"
    },
    {
      image: "https://api.builder.io/api/v1/image/assets/TEMP/9636ecebc1317795128cbd43fb4c60edfe2d4751?width=573",
      minPeople: "Minimum 20 People",
      optionTitle: "OPTION 1 ($25.90 per person)",
      description: "Chicken, Salad (Potato, Pumpkin, Greek or Asian), Bread Rolls, Veggies (Potato, Pumpkin, Greek or Asian)"
    }
  ]

  return (
    <section className="catering-options-section">
      <div className="container">
        <div className="catering-options-grid">
          {options.map((option, index) => (
            <CateringOptionCard
              key={index}
              image={option.image}
              minPeople={option.minPeople}
              optionTitle={option.optionTitle}
              description={option.description}
              linkTo={option.linkTo}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default CateringOptions
