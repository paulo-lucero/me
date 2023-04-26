require 'nokogiri'

# @param element [Nokogiri::HTML5::Node]
# @return [Boolean]
def code_markdown?(element)
  element.classes.any? { |h_class| h_class == 'highlight' }
end

# @param element [Nokogiri::HTML5::Node]
def add_non_code_class(element)
  element_classes = element.classes
  element_classes << 'non-code'
  element['class'] = element_classes.join(' ')
end

# @param content [String] html markdown content
# @return [String] html markdown with classes
def add_default_styles_markdown(content)
  html_doc = ::Nokogiri.HTML5(content)
  line_element = html_doc.css('body').first.first_element_child
  while line_element
    add_non_code_class(line_element) unless code_markdown?(line_element)
    line_element = line_element.next
  end
  html_doc.css('body').first.inner_html
end

class Jekyll::Converters::Markdown::CustomProcessor
  def initialize(config)
    require 'kramdown'
    require 'kramdown-parser-gfm'
    @config = config
  rescue LoadError
    STDERR.puts 'You are missing a library required for Markdown. Please run:'
    STDERR.puts '  $ [sudo] gem install kramdown-parser-gfm'
    raise FatalException.new("Missing dependency: kramdown-parser-gfm")
  end

  def convert(content)
    html_content = ::Kramdown::Document.new(content, input: 'GFM').to_html
    # file_path = File.join('..', '..', 'test', 'markdown-no-class.html')
    # file_path = File.expand_path(file_path, __dir__)
    # File.open(file_path, 'w+') do |file_obj|
    #   file_obj.write html_content
    # end
    add_default_styles_markdown html_content
  end
end
