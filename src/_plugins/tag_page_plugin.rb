module TagPagePlugin
  class TagPageGenerator < Jekyll::Generator
    def generate(site)
      ['pt_BR', 'en_US'].each do |lang|
        site.tags.each do |tag|
          site.pages << TagPage.new(site: site, tag: tag[0].downcase, lang: lang)
        end
      end
    end
  end

  class TagPage < Jekyll::Page
    def initialize(site:, tag:, lang:)
      @site = site

      @base = site.source

      if lang == 'pt_BR'
        @dir = 'pt-br/tags'
        @page_title = "Posts sob a tag '#{tag}'"
        @root_path = ''
      else
        @dir = 'en/tags'
        @page_title = "Posts under the '#{tag}' tag"
        @root_path = '/en'
      end

      # All pages have the same filename.
      @basename = tag
      @ext = '.html'
      @name = "#{tag}.html"

      # Define any custom data you want.
      @data = {
        'title' => @page_title,
        'locale' => lang,
        'permalink' => "#{@root_path}/tags/#{tag}",
        'layout' => 'autopages_tags',
        'selected_tag' => tag,
        'pagination' => {
          'enabled' => true,
          'locale' => lang,
          'tag' => tag
        }
      }
    end
  end
end
