import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import '../benchlot-styles.css';
import { Analytics } from '@vercel/analytics/react';


function SurveyPage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState({
    userType: [],
    projectTypes: [],
    toolSources: [],
    budget: '',
    toolCategories: [],
    buyingPriorities: [],
    willSell: '',
    sellAmount: '',
    sellingNeeds: [],
    transport: [],
    authentication: '',
    openFeedback: '',
    zipCode: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [completedSections, setCompletedSections] = useState(new Set());
  const isCurrentSectionComplete = () => {
    const currentQuestions = sections[currentSection].questions;
    return currentQuestions.every(q => {
      if (q.type === 'checkbox') {
        return formData[q.id]?.length > 0;
      }
      if (q.type === 'textarea') {
        return true; // Optional
      }
      return formData[q.id];
    });
  };
  const sections = [
    {
      title: "About You",
      questions: [
        {
          id: "userType",
          type: "checkbox",
          question: "What best describes you?",
          options: [
            "Professional (make income from your craft/trade)",
            "Hobbyist/Enthusiast",
            "Makerspace member",
            "Other"
          ]
        },
        {
          id: "projectTypes",
          type: "checkbox",
          question: "What types of projects do you work on?",
          options: [
            "Woodworking",
            "Metalworking",
            "Home renovation/improvement",
            "Furniture making",
            "Construction",
            "Automotive",
            "Electronics/Tech",
            "Other"
          ]
        }
      ]
    },
    {
      title: "Tool Marketplace",
      questions: [
        {
          id: "toolSources",
          type: "checkbox",
          question: "Where do you currently get your tools?",
          options: [
            "Home Depot/Lowe's",
            "Woodworking retailers (Rockler, Woodcraft, Lee Valley)",
            "Metalworking suppliers (MSC, Enco, McMaster-Carr)",
            "Industrial suppliers (Grainger, Fastenal)",
            "Machinery dealers (Grizzly, Jet/Powermatic)",
            "Online marketplaces (eBay, Facebook)",
            "Local tool shops",
            "Direct from manufacturers",
            "Other"
          ]
        },
        {
          id: "budget",
          type: "radio",
          question: "What's your typical budget when purchasing a tool?",
          options: [
            "Under $200",
            "$200-$500",
            "$500-$1000",
            "Over $1000"
          ]
        },
        {
          id: "toolCategories",
          type: "checkbox",
          question: "What tool categories are you most interested in?",
          helperText: "Select up to 3",
          maxSelect: 3,
          options: [
            "Hand tools",
            "Power tools (portable)",
            "Large machinery",
            "Workshop equipment",
            "Precision/measuring tools",
            "Accessories & attachments",
            "Other"
          ]
        }
      ]
    },
    {
      title: "Buying & Selling",
      questions: [
        {
          id: "buyingPriorities",
          type: "checkbox",
          question: "What matters most when buying used tools?",
          helperText: "Choose your top 3 priorities",
          maxSelect: 3,
          options: [
            "Price",
            "Verified condition",
            "Original documentation",
            "Warranty/guarantee",
            "Local pickup option",
            "Detailed photos",
            "Seller expertise",
            "Return policy"
          ]
        },
        {
          id: "willSell",
          type: "radio",
          question: "Do you have tools you'd consider selling?",
          options: [
            "Yes, in the next 3 months",
            "Yes, eventually",
            "No"
          ]
        },
        {
          id: "sellAmount",
          type: "radio",
          question: "If yes, roughly how many tools?",
          showIf: (data) => data.willSell?.includes("Yes"),
          options: [
            "1-2 tools",
            "3-5 tools",
            "More than 5 tools"
          ]
        },
        {
          id: "sellingNeeds",
          type: "checkbox",
          question: "What would make you comfortable selling tools online?",
          helperText: "Select your top 3 concerns",
          maxSelect: 3,
          options: [
            "Help with pricing",
            "Verified buyers",
            "Secure payment",
            "Pickup/delivery assistance",
            "Photography help",
            "Expert listing review",
            "Insurance coverage"
          ]
        }
      ]
    },
    {
      title: "Final Questions",
      questions: [
        {
          id: "transport",
          type: "checkbox",
          question: "How would you prefer to handle tool transport?",
          options: [
            "Local pickup",
            "Delivery service",
            "Pickup from secure location (makerspace, store, etc.)",
            "Shipping (for eligible items)"
          ]
        },
        {
          id: "authentication",
          type: "radio",
          question: "Would you pay a small fee for tool authentication?",
          options: [
            "Yes, for expensive tools",
            "Yes, for all purchases",
            "No"
          ]
        },
        {
          id: "openFeedback",
          type: "textarea",
          question: "What would make you choose Benchlot as your go-to tool marketplace?",
          placeholder: "Share your thoughts..."
        },
        {
          id: "zipCode",
          type: "text",
          question: "What's your ZIP code?",
          helperText: "Your local marketplace experience will be based on your location",
          validation: (value) => /^\d{5}$/.test(value)
        }
      ]
    }
  ];

  const handleInputChange = (questionId, value, isCheckbox = false) => {
    setFormData(prev => {
      if (isCheckbox) {
        const currentValues = prev[questionId] || [];
        if (currentValues.includes(value)) {
          return {
            ...prev,
            [questionId]: currentValues.filter(v => v !== value)
          };
        } else {
          return {
            ...prev,
            [questionId]: [...currentValues, value]
          };
        }
      }
      return {
        ...prev,
        [questionId]: value
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const urlParams = new URLSearchParams(window.location.search);
      let email = urlParams.get('email');
      // Fix email encoding
      email = email.replace(' ', '+');
      console.log('Attempting update for email:', email);

      // Stringify the form data
      const formDataString = JSON.stringify(formData);
      console.log('Sending data:', formDataString);

      // First verify the email exists
      const { data: checkData, error: checkError } = await supabase
        .from('waitlist')
        .select('email')
        .eq('email', email)
        .single();

      if (checkError || !checkData) {
        console.error('Email check failed:', checkError);
        throw new Error('Email not found');
      }

      console.log('Email found:', checkData);

      // Now try the update
      const { data, error } = await supabase
        .from('waitlist')
        .update({
          survey_responses: formDataString,
          survey_completed_at: new Date().toISOString()
        })
        .eq('email', email)
        .select();

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      console.log('Update successful:', data);
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Full error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
};
  useEffect(() => {
    console.log('Current section:', currentSection);
    console.log('Current form data:', formData);
  }, [currentSection, formData]);

  const nextSection = () => {
    if (isCurrentSectionComplete()) {
      setCompletedSections(prev => new Set([...prev, currentSection]));
      if (currentSection < sections.length - 1) {
        setCurrentSection(prev => prev + 1);
        window.scrollTo(0, 0);
      }
    } else {
      setError('Please complete all required fields before continuing');
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  if (success) {
    return (
      <div className="container">
        <div className="email-form success-screen">
          <div className="success-icon">
            <CheckCircle2 />
          </div>
          <h2 className="feature-title success-title">Thanks for Your Input!</h2>
          <p className="form-text success-message">
            Your $50 credit has been secured. We'll be in touch soon with early access details and your credit information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <h1 className="hero-title text-center">Help Shape Benchlot</h1>
        <p className="hero-text text-center">
          Thanks for helping us build a better tool marketplace! This quick survey will take about 5 minutes.
        </p>

        {error && (
          <div className="survey-error">
            <AlertCircle />
            <p>{error}</p>
          </div>
        )}

        <div className="email-form">
          <div className="form-header">
            <div className="flex items-center justify-between mb-6">
              <h3 className="feature-title">{sections[currentSection].title}</h3>
              <span className="text-sm text-stone-600">
                Step {currentSection + 1} of {sections.length}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }} />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {sections[currentSection].questions.map((q) => (
              <div key={q.id} className="survey-question-wrapper">
                <div className="survey-question">
                  <label className="section-title">
                    {q.question}
                  </label>
                  {q.helperText && (
                    <p className="helper-text">{q.helperText}</p>
                  )}
                </div>

                {q.type === "checkbox" && (
                  <div className="radio-group">
                    {q.options.map((option) => (
                      <div key={option} className="radio-option">
                        <input
                          type="checkbox"
                          id={`${q.id}-${option}`}
                          checked={formData[q.id]?.includes(option)}
                          onChange={() => handleInputChange(q.id, option, true)}
                          className="checkbox-input"
                          disabled={q.maxSelect && formData[q.id]?.length >= q.maxSelect && !formData[q.id]?.includes(option)} />
                        <label htmlFor={`${q.id}-${option}`} className="checkbox-label">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {q.type === "radio" && (
                  <div className="radio-group">
                    {q.options.map((option) => (
                      <div key={option} className="radio-option">
                        <input
                          type="radio"
                          id={`${q.id}-${option}`}
                          name={q.id}
                          value={option}
                          checked={formData[q.id] === option}
                          onChange={(e) => handleInputChange(q.id, e.target.value)}
                          className="radio-input" />
                        <label htmlFor={`${q.id}-${option}`} className="radio-label">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {q.type === "textarea" && (
                  <textarea
                    id={q.id}
                    value={formData[q.id] || ""}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    placeholder={q.placeholder}
                    className="survey-textarea"
                    rows={4} />
                )}

                {q.type === "text" && (
                  <input
                    type="text"
                    id={q.id}
                    value={formData[q.id] || ""}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    className="survey-input" />
                )}
              </div>
            ))}

<div className="survey-navigation">
              {currentSection > 0 && (
                <button
                  type="button"
                  onClick={prevSection}
                  className="submit-button"
                  disabled={submitting}
                >
                  Previous
                </button>
              )}

              {currentSection === sections.length - 1 ? (
                <button
                  type="submit"
                  className="submit-button"
                  disabled={submitting || !isCurrentSectionComplete()}
                >
                  {submitting ? 'Submitting...' : 'Submit Survey'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextSection}
                  className="submit-button"
                  disabled={submitting || !isCurrentSectionComplete()}
                >
                  Next
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
    
  );
}
<Analytics />
export default SurveyPage;