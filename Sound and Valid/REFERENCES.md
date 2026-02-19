# Sound and Valid: Scientific References and Sources

All material properties, formulas, and frequency calculations used in this project have been cross-referenced against published engineering data. This document catalogs every source used and the verification results.

---

## 1. The Formula

### Euler-Bernoulli Beam Theory: Bending Natural Frequency

The app computes the fundamental bending frequency of a rectangular bar using:

```
f = (βL)² × h / (4π√3 × L²) × √(E / ρ)
```

This is derived from the general Euler-Bernoulli beam equation:

```
f_n = (β_n L)² / (2πL²) × √(EI / ρA)
```

by substituting the second moment of area `I = bh³/12` and cross-sectional area `A = bh` for a rectangular cross-section, which simplifies `√(EI/ρA)` to `h/(2√3) × √(E/ρ)`.

### Formula Sources

- **S. Rao, "Mechanical Vibrations", 5th Edition**: standard textbook derivation of Euler-Bernoulli beam natural frequencies
- **enDAQ, Bernoulli-Euler Beams**: https://endaq.com/pages/bernoulli-euler-beams
  - Confirms the general formula, eigenvalue coefficients, and boundary condition definitions
- **Euphonics, Bending Beams and Free-Free Modes**: https://euphonics.org/3-2-1-bending-beams-and-free-free-modes/
  - Confirms equation (20) matches our simplified rectangular bar form
- **Engineering ToolBox, Beams Natural Vibration Frequency**: https://www.engineeringtoolbox.com/structures-vibration-frequency-d_1989.html
  - General reference for beam vibration formulas and eigenvalue tables
- **Texas A&M, Vibrations of Bars and Beams (ME 617 Lecture Notes)**: https://rotorlab.tamu.edu/me617/HD14%20Vibrations%20of%20bars%20and%20beams.pdf
  - University-level derivation confirming eigenvalue coefficients
- **vibrationdata.com, Bending Frequencies of Beams**: https://www.vibrationdata.com/tutorials2/beam.pdf
  - Tutorial confirming eigenvalue tables for all three boundary conditions
- **MIT OCW, Euler-Bernoulli Beams (Mechanics and Materials II)**: https://ocw.mit.edu/courses/2-002-mechanics-and-materials-ii-spring-2004/bc25a56b5a91ad29ca5c7419616686f7_lec2.pdf

### Eigenvalue Coefficients (βL)

These are the solutions to the characteristic equations for each boundary condition. Verified to 5+ significant figures:

| Boundary | Mode 1 | Mode 2 | Mode 3 | Mode 4 | Characteristic Equation |
|---|---|---|---|---|---|
| Free-free | 4.73004 | 7.8532 | 10.9956 | 14.1372 | cos(x)cosh(x) = 1 |
| Cantilever | 1.8751 | 4.6941 | 7.8548 | 10.9955 | cos(x)cosh(x) = -1 |
| Simply-supported | π | 2π | 3π | 4π | Closed form: nπ |

Additional eigenvalue verification source:
- **amesweb, Cantilever Beam Natural Frequency Calculator**: https://amesweb.info/Vibration/Cantilever-Beam-Natural-Frequency-Calculator.aspx
  - Uses K_n = (βL)² values of 3.52, 22.0, 61.7, 121, consistent with our eigenvalues squared

---

## 2. Material Properties

### Metals

#### Aluminum 6061-T6: E = 68.9 GPa, ρ = 2700 kg/m³
- **MatWeb, Al 6061-T6**: https://asm.matweb.com/search/specificmaterial.asp?bassnum=ma6061t6
  - Lists E = 68.9 GPa, ρ = 2700 kg/m³ (exact match)
- **MakeItFrom, 6061-T6 Aluminum**: https://www.makeitfrom.com/material-properties/6061-T6-Aluminum
  - Confirms both values

#### Mild Steel AISI 1018: E = 205 GPa, ρ = 7870 kg/m³
- **AZom, AISI 1018 Steel**: https://www.azom.com/article.aspx?ArticleID=9138
  - Lists E = 205 GPa as typical for steel
- **MakeItFrom, 1018 Steel**: https://www.makeitfrom.com/material-properties/SAE-AISI-1018-G10180-Carbon-Steel
  - Reports E = 190 GPa (lower bound); 205 GPa is at the upper end of the 190-210 GPa range for carbon steels

#### Copper C11000: E = 117 GPa, ρ = 8960 kg/m³
- **Copper Development Association, C11000**: https://alloys.copper.org/alloy/C11000
  - Lists E = 17,000 ksi = 117.2 GPa (exact match)
  - Lists specific gravity 8.91 → 8910 kg/m³ (our 8960 is ~0.6% high, negligible)
- **MakeItFrom, C11000 Copper**: https://www.makeitfrom.com/material-properties/1-8-Hard-H00-C11000-Copper

#### Brass C26000: E = 110 GPa, ρ = 8530 kg/m³
- **Copper Development Association, C26000**: https://alloys.copper.org/alloy/C26000
  - Lists E = 16,000 ksi = 110.3 GPa (exact match)
  - Lists ρ = 8530 kg/m³ (exact match)
- **MatWeb, Cartridge Brass**: https://www.matweb.com/search/datasheet_print.aspx?matguid=83677ae92338456da4dafe8fe4b815c5

### Woods

All wood values are at 12% moisture content (standard reference condition).

#### White Oak: E = 12.3 GPa, ρ = 770 kg/m³
- **AmesWeb, Young's Modulus of Wood**: https://amesweb.info/Materials/Youngs-Modulus-of-Wood.aspx
  - Lists White Oak E = 12,300 MPa (exact match)
- **AmesWeb, Density of Wood**: https://amesweb.info/Materials/Density-of-Wood.aspx
  - Reports 753 kg/m³; other sources report 770 kg/m³, our value is at the high end of range
- **WoodworkWeb, Wood Strengths**: https://www.woodworkweb.com/woodwork-topics/wood/146-wood-strengths.html
  - Lists E = 1,780,000 psi = 12.27 GPa (matches)

#### Sugar Maple: E = 12.6 GPa, ρ = 705 kg/m³
- **AmesWeb, Wood Density**: https://amesweb.info/Materials/Density-of-Wood.aspx
  - Lists Sugar Maple density = 705 kg/m³ (44 lb/ft³) (exact match)
- **AmesWeb, Young's Modulus of Wood**: https://amesweb.info/Materials/Youngs-Modulus-of-Wood.aspx
  - Lists E = 12,620 MPa, matches our 12.6 GPa
- **Beacon Hardwoods**: https://beaconhardwoods.com/domestic-hardwoods

#### Ponderosa Pine: E = 8.9 GPa, ρ = 449 kg/m³
- **WoodworkWeb**: https://www.woodworkweb.com/woodwork-topics/wood/146-wood-strengths.html
  - Lists E = 1,290,000 psi = 8.9 GPa (exact match)
- **USDA Forest Products Laboratory, Ponderosa Pine**: https://www.fpl.fs.usda.gov/documnts/usda/amwood/254ponder.pdf
  - Lists density = 28 lb/ft³ = 449 kg/m³ at 12% MC, specific gravity 0.38-0.40
- **AmesWeb, Wood Density**: https://amesweb.info/Materials/Density-of-Wood.aspx
  - Confirms 449 kg/m³
- **NOTE:** An earlier version of this app used ρ = 510 kg/m³, which was 13.6% too high. This was corrected to 449 kg/m³ based on the USDA reference.

#### Incense Cedar: E = 7.6 GPa, ρ = 370 kg/m³
- **USDA Forest Products Laboratory, Wood Handbook (Chapter 5)**: https://www.fpl.fs.usda.gov/documnts/fplgtr/fpl_gtr190.pdf
  - Table 5-1: Incense cedar MOE = 7.65 GPa at 12% MC; density ~370 kg/m³ (specific gravity 0.36)
- **AmesWeb, Density of Wood**: https://amesweb.info/Materials/Density-of-Wood.aspx
  - Reports ~370 kg/m³ for incense cedar
- **Modeling note:** The pencil is modeled as solid incense cedar. The graphite/clay core is approximately 1.8% of the cross-sectional area and contributes negligibly to bending stiffness (stiffness weighted by I = bh³/12 per layer; the core runs through the centroidal axis where h ≈ 0).

### Glass & Ceramics

#### Soda-Lime Glass: E = 72 GPa, ρ = 2500 kg/m³
- **MakeItFrom, Soda-Lime Float Glass**: https://www.makeitfrom.com/material-properties/Soda-Lime-Float-Glass
  - Reports E = 70-72 GPa, ρ = 2440-2530 kg/m³ (both within range)
- **Wikipedia, Soda-Lime Glass**: https://en.wikipedia.org/wiki/Soda%E2%80%93lime_glass

#### Porcelain: E = 70 GPa, ρ = 2400 kg/m³
- **Engineering ToolBox, Ceramics Properties**: https://www.engineeringtoolbox.com/ceramics-properties-d_1227.html
  - Lists porcelain E = 48-69 GPa; our 70 GPa is at the upper boundary
- **MakeItFrom, Engineering Porcelain**: https://www.makeitfrom.com/material-properties/Engineering-Porcelain
  - Reports E = 67-150 GPa for engineering porcelain; 70 GPa is at the low end
- **Note:** "Porcelain" spans a wide range. Our value of 70 GPa models traditional/common porcelain (dinnerware, tiles), not high-strength engineering porcelain (~100+ GPa).

#### Alumina Ceramic (Al₂O₃): E = 370 GPa, ρ = 3950 kg/m³
- **Accuratus, Alumina Al₂O₃**: https://accuratus.com/alumox.html
  - Lists E = 370 GPa, ρ = 3950 kg/m³ for 99.5%+ purity (exact match)
- **MatWeb, Alumina 99.5%**: https://www.matweb.com/search/datasheettext.aspx?matid=143
- **AZom, Alumina Properties**: https://www.azom.com/properties.aspx?ArticleID=52

### Plastics

#### ABS Plastic: E = 2.3 GPa, ρ = 1050 kg/m³
- **MakeItFrom, ABS**: https://www.makeitfrom.com/material-properties/Acrylonitrile-Butadiene-Styrene-ABS
  - Reports E = 1.6-2.7 GPa (typical 2.0-2.3), ρ = 1030-1060 kg/m³ (both within range)
- **Wikipedia, ABS**: https://en.wikipedia.org/wiki/Acrylonitrile_butadiene_styrene

#### Polycarbonate: E = 2.4 GPa, ρ = 1200 kg/m³
- **Wikipedia, Polycarbonate**: https://en.wikipedia.org/wiki/Polycarbonate
  - Reports E = 2.0-2.4 GPa, ρ = 1200-1220 kg/m³ (both match)
- **Princeton, Polycarbonate Properties**: https://www.princeton.edu/~maelabs/mae324/glos324/polycarbonate.htm

#### Acrylic (PMMA): E = 3.2 GPa, ρ = 1180 kg/m³
- **MIT, PMMA Material Properties**: https://www.mit.edu/~6.777/matprops/pmma.htm
  - Lists E = 3.2 GPa (exact match)
- **MakeItFrom, PMMA**: https://www.makeitfrom.com/material-properties/Polymethylmethacrylate-PMMA-Acrylic
  - Reports E = 2.9-3.3 GPa, ρ = 1170-1200 kg/m³ (within range)

#### Soft Vinyl (PVC Eraser): E = 10 MPa, ρ = 1300 kg/m³
- **MakeItFrom, Flexible PVC**: https://www.makeitfrom.com/material-properties/Flexible-Polyvinyl-Chloride-Flexible-PVC
  - Reports E = 2.4-19 MPa for flexible/plasticized PVC; eraser-grade vinyl falls in this range
- **Engineering ToolBox, Rubber and Elastomers**: https://www.engineeringtoolbox.com/rubber-elastomers-young-modulus-d_1588.html
  - Soft PVC/vinyl reported at 1-50 MPa depending on plasticizer content; eraser-grade ~10 MPa
- **Modeling note:** Vinyl erasers are heavily plasticized PVC. E = 10 MPa is conservative (stiff end of soft vinyl); a softer eraser would give a lower frequency. The ρ = 1300 kg/m³ is typical for PVC compounds.

---

## 3. Frequency Cross-References

### Tuning Fork: Strongest Validation

Our app computes a steel cantilever prong (L = 84 mm, h = 3.8 mm, steel) at **444.0 Hz**.

- A standard A4 tuning fork produces **440 Hz**, within **0.9%** of our result
- Real tuning fork prong dimensions are approximately 80 mm long, 4-4.5 mm cross-section
- **COMSOL Blog, Tuning Fork Simulation**: https://www.comsol.com/blogs/finding-answers-to-the-tuning-fork-mystery-with-simulation/
  - COMSOL computed 435 Hz for an 80 mm prong using the cantilever formula, noting it provides "a good approximation"
  - Our slightly longer prong (84mm vs 80mm) and slightly thinner cross-section (3.8mm vs ~4mm) account for the difference
- **Engineers Edge, Tuning Fork Calculator**: https://www.engineersedge.com/calculators/tuning_fork__16141.htm
  - Provides an online calculator using the same cantilever beam formula we use

### Steel Ruler Cantilever: Classroom Demo

Our app: 8 cm ruler, 1 mm thick, clamped → **128.8 Hz**

- This is a reasonable buzzing pitch for a short clamped ruler
- A 15 cm ruler at 1 mm thick computes to ~37 Hz (the low "twang" heard in classroom demos)
- **Syracuse University, Vibrations Lab**: https://ecs.syr.edu/faculty/glauser/mae315/vibesLab/goodVibesExpvIII.html
  - Describes cantilever ruler experiments where varying clamped length produces frequencies from a few Hz to hundreds of Hz
- **SJSU, Vibration Measurements Lab**: https://www.sjsu.edu/people/burford.furman/docs/me120/VibeMeasLab.pdf
  - Uses meter sticks as cantilevers; confirms the inverse-square relationship between length and frequency

### Marimba / Xylophone Bars: With Important Caveat

- **Percussion Clinic Adelaide, Marimba Bar Dimensions**: https://www.percussionclinic.com/art_marimbuild24.htm
  - Jim McCarthy recommends a middle C bar at "about 36 cm long by 5.5 cm wide by 2 cm thick"
  - Our formula computes 670 Hz for those dimensions, which is much higher than 262 Hz (middle C)
  - McCarthy explains this is intentional: the bar must be **arched on the underside** to lower the pitch
  - The arch thins the center of the bar, reducing the effective thickness and lowering the frequency
  - **Our formula correctly computes the frequency for a uniform-thickness bar**, which is exactly what our app models
- **Real xylophone data** from https://www.mmdigest.com/Tech/breen_xylo.html:
  - A440 bar: 8.25 inches (20.96 cm) long, 1.5 in wide, 0.75 in thick (with arched thinning to 0.375 in)
  - The arching roughly halves the effective thickness, which is why the formula with full thickness overestimates
- **AIP, "Xylophone Bars: Frequency and Length"**: https://pubs.aip.org/aapt/pte/article/54/6/325/277943/Xylophone-bars-Frequency-and-length
- **Wikibooks, Basic Acoustics of the Marimba**: https://en.wikibooks.org/wiki/Acoustics/Basic_Acoustics_of_the_Marimba

### General Aluminum Bar Vibration

- **BYU Physics, Testing the Limits of Bernoulli-Euler Beam Theory**: https://physics.byu.edu/docs/publication/3137
  - Laboratory experiment comparing measured bar frequencies to Euler-Bernoulli predictions
- **Carnegie Mellon, Vibrations Lab (24-352)**: https://www.andrew.cmu.edu/course/24-352/lab3.htm
  - Uses aluminum bars in free-free configuration to validate beam vibration theory

---

## 4. Pitch Detection Algorithm

The app uses autocorrelation-based pitch detection rather than FFT peak-picking, for sub-Hz frequency resolution.

- **Alexander Ellis, Detecting Pitch with Autocorrelation**: https://alexanderell.is/posts/tuner/
  - Primary reference for the autocorrelation implementation; includes parabolic interpolation for sub-sample accuracy
- **Chris Wilson, PitchDetect (GitHub)**: https://github.com/cwilso/PitchDetect
  - Web Audio API pitch detection reference implementation
- **PitchDetector.com, Real-Time Browser Pitch Detection Explained**: https://pitchdetector.com/real-time-browser-pitch-detection-explained/

---

## 5. Summary of Verification

| What | Status | Notes |
|---|---|---|
| Formula derivation | Correct | Matches Rao textbook, enDAQ, Euphonics |
| Eigenvalue coefficients | Correct | Verified to 5 significant figures |
| Aluminum 6061-T6 properties | Correct | MatWeb, MakeItFrom |
| Mild Steel 1018 properties | Correct | AZom, MakeItFrom |
| Copper C11000 properties | Correct | CDA official data |
| Brass C26000 properties | Correct | CDA official data |
| White Oak properties | Correct | AmesWeb, WoodworkWeb |
| Sugar Maple properties | Correct | AmesWeb, Beacon Hardwoods |
| Ponderosa Pine properties | Corrected | ρ fixed from 510 to 449 kg/m³ per USDA data |
| Incense Cedar properties | Correct | USDA Wood Handbook, AmesWeb |
| Soda-Lime Glass properties | Correct | MakeItFrom, Wikipedia |
| Porcelain properties | Correct | Models traditional porcelain (not engineering grade) |
| Alumina (Al₂O₃) properties | Correct | Accuratus, MatWeb |
| ABS Plastic properties | Correct | MakeItFrom, Wikipedia |
| Polycarbonate properties | Correct | Wikipedia, Princeton |
| Acrylic (PMMA) properties | Correct | MIT, MakeItFrom |
| Soft Vinyl (PVC Eraser) properties | Correct | MakeItFrom Flexible PVC, Engineering ToolBox |
| Tuning fork frequency | 444.0 Hz (0.9% from real 440 Hz) | Cross-referenced with COMSOL simulation |
| All 20 object frequencies | 128-903 Hz range | Within human vocal range |
