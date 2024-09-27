import React, { useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const BodyCompositionForm = () => {
  const [formData, setFormData] = useState({
    bodyType: '',
    gender: 'Female',
    age: '',
    height: '',
    clothesWeight: '',
    weight: '',
    fatPercentage: '',
    fatMass: '',
    muscleMass: '',
    tbw: '',
    boneMass: '',
    bmr: '',
    metabolicAge: '',
    visceralFatRating: '',
    bmi: '',
    idealBodyWeight: '',
    degreeOfObesity: '',
    fatPercentageNew: '',
    fatMassNew: '',

  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const printRef = React.useRef();
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  return (
    <div className="container mx-auto p-4">
      {/* Form for user input */}
      <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="bodyType">Body Type</Label>
            <Input 
              type="text" 
              id="bodyType"
              name="bodyType"
              value={formData.bodyType} 
              onChange={handleChange} 
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="gender">Gender</Label>
            <Input 
              type="text" 
              id="gender"
              name="gender"
              value={formData.gender} 
              onChange={handleChange} 
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="age">Age</Label>
            <Input 
              type="number" 
              id="age"
              name="age"
              value={formData.age} 
              onChange={handleChange} 
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="height">Height (cm)</Label>
            <Input 
              type="number" 
              id="height"
              name="height"
              value={formData.height} 
              onChange={handleChange} 
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="clothesWeight">Clothes Weight (kg)</Label>
            <Input 
              type="number" 
              id="clothesWeight"
              name="clothesWeight"
              value={formData.clothesWeight} 
              onChange={handleChange} 
            />
          </div>

          {/* Additional inputs */}
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="fatPercentage">Fat %</Label>
            <Input 
              type="number" 
              id="fatPercentage"
              name="fatPercentage"
              value={formData.fatPercentage} 
              onChange={handleChange} 
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="fatMass">Fat Mass (kg)</Label>
            <Input 
              type="number" 
              id="fatMass"
              name="fatMass"
              value={formData.fatMass} 
              onChange={handleChange} 
            />
          </div>

          {/* More form inputs */}
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input 
              type="number" 
              id="weight"
              name="weight"
              value={formData.weight} 
              onChange={handleChange} 
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="muscleMass">Muscle Mass (kg)</Label>
            <Input 
              type="number" 
              id="muscleMass"
              name="muscleMass"
              value={formData.muscleMass} 
              onChange={handleChange} 
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="tbw">TBW (%)</Label>
            <Input 
              type="number" 
              id="tbw"
              name="tbw"
              value={formData.tbw} 
              onChange={handleChange} 
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="boneMass">Bone Mass (kg)</Label>
            <Input 
              type="number" 
              id="boneMass"
              name="boneMass"
              value={formData.boneMass} 
              onChange={handleChange} 
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="bmr">BMR (kcal)</Label>
            <Input 
              type="number" 
              id="bmr"
              name="bmr"
              value={formData.bmr} 
              onChange={handleChange} 
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="metabolicAge">Metabolic Age</Label>
            <Input 
              type="number" 
              id="metabolicAge"
              name="metabolicAge"
              value={formData.metabolicAge} 
              onChange={handleChange} 
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="visceralFatRating">Visceral Fat Rating</Label>
            <Input 
              type="number" 
              id="visceralFatRating"
              name="visceralFatRating"
              value={formData.visceralFatRating} 
              onChange={handleChange} 
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="bmi">BMI</Label>
            <Input 
              type="number" 
              id="bmi"
              name="bmi"
              value={formData.bmi} 
              onChange={handleChange} 
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="idealBodyWeight">Ideal Body Weight (kg)</Label>
            <Input 
              type="number" 
              id="idealBodyWeight"
              name="idealBodyWeight"
              value={formData.idealBodyWeight} 
              onChange={handleChange} 
            />
          </div>

          
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="degreeOfObesity">Degree of Obesity (%)</Label>
            <Input 
              type="number" 
              id="degreeOfObesity"
              name="degreeOfObesity"
              value={formData.degreeOfObesity} 
              onChange={handleChange} 
            />
          </div>

          {/* New Fat % and Fat Mass (kg) inputs */}
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="fatPercentageNew">Fat %</Label>
            <Input 
              type="number" 
              id="fatPercentageNew"
              name="fatPercentageNew"
              value={formData.fatPercentageNew} 
              onChange={handleChange} 
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="fatMassNew">Fat Mass (kg)</Label>
            <Input 
              type="number" 
              id="fatMassNew"
              name="fatMassNew"
              value={formData.fatMassNew} 
              onChange={handleChange} 
            />
          </div>


        <Button onClick={handlePrint}>Print Receipt</Button>
      </div>

 {/* Printable area for the receipt */}
 <div ref={printRef} className="print-area hidden">
        <div className="receipt-container">
          <h2 className="text-center brand">Her Chamber Fitness</h2>
          <p className="text-center receipt-title">BODY COMPOSITION ANALYZER</p>
          <p className="text-center date">{new Date().toLocaleDateString()}</p>
          
          <div className="section">
            <p className="section-title">INPUT</p>
            <p>Body Type: <span>{formData.bodyType}</span></p>
            <p>Gender: <span>{formData.gender}</span></p>
            <p>Age: <span>{formData.age}</span></p>
            <p>Height: <span>{formData.height} cm</span></p>
            <p>Clothes Weight: <span>{formData.clothesWeight} kg</span></p>
          </div>

          <div className="section">
            <p className="section-title">RESULT</p>
            <p>Weight: <span>{formData.weight} kg</span></p>
            <p>Fat %: <span>{formData.fatPercentage}%</span></p>
            <p>Fat Mass: <span>{formData.fatMass} kg</span></p>
            <p>Muscle Mass: <span>{formData.muscleMass} kg</span></p>
            <p>TBW: <span>{formData.tbw}%</span></p>
            <p>Bone Mass: <span>{formData.boneMass} kg</span></p>
            <p>BMR: <span>{formData.bmr} kcal</span></p>
            <p>Metabolic Age: <span>{formData.metabolicAge}</span></p>
            <p>Visceral Fat Rating: <span>{formData.visceralFatRating}</span></p>
            <p>BMI: <span>{formData.bmi}</span></p>
            <p>Ideal Body Weight: <span>{formData.idealBodyWeight} kg</span></p>
            <p>Degree of Obesity: <span>{formData.degreeOfObesity}%</span></p>
          </div>

          <div className="section desirable-range">
            <p className="section-title">DESIRABLE RANGE</p>
            <p>Fat %: <span>{formData.fatPercentageNew}%</span></p>
            <p>Fat Mass: <span>{formData.fatMassNew} kg</span></p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .print-area {
            display: block !important;
          }
        }
        .print-area {
          display: none;
        }
        .receipt-container {
          font-family: 'Arial, sans-serif';
          width: 270px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 10px;
          background-color: #fff;
        }
        .text-center {
          text-align: center;
        }
        .brand {
          font-weight: bold;
          font-size: 24px;
          color: #333;
        }
        .receipt-title {
          font-size: 14px;
          margin-bottom: 10px;
          text-transform: uppercase;
          color: #666;
        }
        .date {
          font-size: 12px;
          margin-bottom: 15px;
          color: #666;
        }
        .section {
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #ddd;
        }
        .section-title {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 8px;
          color: #444;
          text-transform: uppercase;
        }
        .section p {
          margin: 0;
          font-size: 14px;
          color: #333;
        }
        .section p span {
          float: right;
          font-weight: bold;
        }
       
        .desirable-range p {
          font-size: 14px;
          color: #444;
        }
      `}</style>
    </div>
  );
};

export default BodyCompositionForm;