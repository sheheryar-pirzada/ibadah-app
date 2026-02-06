Pod::Spec.new do |s|
  s.name           = 'ARQibla'
  s.version        = '1.0.0'
  s.summary        = 'AR Qibla direction module for Expo'
  s.description    = 'AR Qibla direction using ARKit and RealityKit'
  s.license        = { :type => 'MIT' }
  s.authors        = { 'Peer Sahab' => 'dev@example.com' }
  s.homepage       = 'https://github.com/expo/expo'
  s.platforms      = { :ios => '15.1' }
  # Local module source (used by Expo autolinking)
  s.source         = { :path => '.' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = 'ios/**/*.{swift,h,m}'
  s.swift_version = '5.4'

  s.frameworks = 'ARKit', 'RealityKit'
end
