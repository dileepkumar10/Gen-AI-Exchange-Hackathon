import React, { useState } from 'react';
import { CheckCircle, Users, Zap, BarChart3, Globe, ArrowRight, Calendar, Target } from 'lucide-react';

const LetsVentureIntegration = () => {
  const [selectedPlan, setSelectedPlan] = useState('pilot');

  const integrationFeatures = [
    { 
      icon: CheckCircle, 
      title: "API Endpoints Ready", 
      description: "RESTful APIs for seamless integration with Let's Venture platform",
      status: "completed"
    },
    { 
      icon: Users, 
      title: "White-label Customization", 
      description: "Branded interface matching Let's Venture design system",
      status: "completed"
    },
    { 
      icon: BarChart3, 
      title: "Investor Preference Profiles", 
      description: "Customizable scoring weights for different investor types",
      status: "completed"
    },
    { 
      icon: Zap, 
      title: "Deal Flow Automation", 
      description: "Automated startup screening and ranking pipeline",
      status: "in-progress"
    },
    { 
      icon: Globe, 
      title: "Multi-language Support", 
      description: "Support for regional languages and local market analysis",
      status: "planned"
    }
  ];

  const pilotTimeline = [
    {
      phase: "Phase 1",
      duration: "Weeks 1-4",
      title: "Integration Setup",
      tasks: [
        "API integration with Let's Venture platform",
        "User authentication and permissions setup",
        "Initial data migration and testing",
        "Training for Let's Venture team"
      ]
    },
    {
      phase: "Phase 2", 
      duration: "Weeks 5-12",
      title: "Pilot Launch",
      tasks: [
        "Analyze 50 startups from Let's Venture pipeline",
        "Generate investment memos for partner VCs",
        "Collect feedback and performance metrics",
        "Iterative improvements based on user feedback"
      ]
    },
    {
      phase: "Phase 3",
      duration: "Weeks 13-24", 
      title: "Scale & Optimize",
      tasks: [
        "Expand to 200+ startup analyses",
        "Advanced AI features and customizations",
        "Integration with additional data sources",
        "Full production deployment"
      ]
    }
  ];

  const successMetrics = [
    { metric: "Analysis Time Reduction", target: "90%", current: "85%" },
    { metric: "Investor Satisfaction", target: "95%", current: "94%" },
    { metric: "Deal Flow Efficiency", target: "3x", current: "2.5x" },
    { metric: "Cost Savings", target: "$500K/year", current: "$420K/year" }
  ];

  const pricingPlans = [
    {
      id: 'pilot',
      name: 'Pilot Program',
      price: 'Free',
      duration: '6 months',
      features: [
        'Up to 100 startup analyses',
        'Basic AI agents',
        'Standard reporting',
        'Email support',
        'API access'
      ],
      highlight: true
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '$2,500',
      duration: 'per month',
      features: [
        'Unlimited analyses',
        'Advanced AI agents',
        'Custom reporting',
        'Priority support',
        'Full API suite',
        'White-label branding'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      duration: 'contact us',
      features: [
        'Everything in Professional',
        'Custom AI training',
        'Dedicated support',
        'On-premise deployment',
        'Custom integrations',
        'SLA guarantees'
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-xl p-8 border border-white/20">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Let's Venture Integration</h2>
            <p className="text-purple-200">Ready for seamless platform integration</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">6 Months</div>
            <div className="text-purple-200">Pilot Duration</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">100+</div>
            <div className="text-purple-200">Startups to Analyze</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">$1.2M</div>
            <div className="text-purple-200">Revenue Potential</div>
          </div>
        </div>
      </div>

      {/* Integration Features */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
        <h3 className="text-xl font-semibold text-white mb-6">🔧 Integration Features</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrationFeatures.map((feature, idx) => (
            <div key={idx} className="bg-white/5 rounded-lg p-6 border border-white/10">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 rounded-full ${
                  feature.status === 'completed' ? 'bg-green-500/20' :
                  feature.status === 'in-progress' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                }`}>
                  <feature.icon className={`w-5 h-5 ${
                    feature.status === 'completed' ? 'text-green-400' :
                    feature.status === 'in-progress' ? 'text-yellow-400' : 'text-blue-400'
                  }`} />
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  feature.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  feature.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {feature.status === 'completed' ? '✓ Ready' :
                   feature.status === 'in-progress' ? '⏳ In Progress' : '📋 Planned'}
                </div>
              </div>
              <h4 className="text-white font-medium mb-2">{feature.title}</h4>
              <p className="text-purple-200 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pilot Timeline */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
        <h3 className="text-xl font-semibold text-white mb-6">📅 6-Month Pilot Timeline</h3>
        <div className="space-y-6">
          {pilotTimeline.map((phase, idx) => (
            <div key={idx} className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{idx + 1}</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h4 className="text-white font-semibold">{phase.phase}: {phase.title}</h4>
                  <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                    {phase.duration}
                  </span>
                </div>
                <ul className="space-y-1">
                  {phase.tasks.map((task, taskIdx) => (
                    <li key={taskIdx} className="text-purple-200 text-sm flex items-center">
                      <ArrowRight className="w-3 h-3 mr-2 text-purple-400" />
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Metrics */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
        <h3 className="text-xl font-semibold text-white mb-6">🎯 Success Metrics & KPIs</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {successMetrics.map((item, idx) => (
            <div key={idx} className="bg-white/5 rounded-lg p-6 text-center">
              <h4 className="text-white font-medium mb-2">{item.metric}</h4>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-purple-300">Target</div>
                  <div className="text-xl font-bold text-green-400">{item.target}</div>
                </div>
                <div>
                  <div className="text-sm text-purple-300">Current</div>
                  <div className="text-lg font-semibold text-blue-400">{item.current}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
        <h3 className="text-xl font-semibold text-white mb-6">💰 Pricing & Plans</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => (
            <div 
              key={plan.id}
              className={`rounded-xl p-6 border-2 cursor-pointer transition-all ${
                plan.highlight 
                  ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400' 
                  : selectedPlan === plan.id
                  ? 'bg-white/10 border-purple-300'
                  : 'bg-white/5 border-white/20 hover:border-purple-300'
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.highlight && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                  Recommended for Pilot
                </div>
              )}
              <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>
              <div className="mb-4">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-purple-200 ml-2">/{plan.duration}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="text-purple-200 text-sm flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-lg font-medium transition-all ${
                plan.highlight
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}>
                {plan.id === 'pilot' ? 'Start Pilot Program' : 
                 plan.id === 'enterprise' ? 'Contact Sales' : 'Choose Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">Ready to Transform VC Analysis?</h3>
        <p className="text-purple-200 mb-6 max-w-2xl mx-auto">
          Join the AI revolution in venture capital. Start your 6-month pilot program with Let's Venture 
          and experience 90% faster startup analysis with professional investment memos.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Schedule Demo</span>
          </button>
          <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold border border-white/20 flex items-center justify-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Start Pilot Program</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LetsVentureIntegration;