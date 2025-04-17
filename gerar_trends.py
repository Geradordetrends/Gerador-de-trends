import tweepy
import json
import feedparser
import re

# Configuração da API do Twitter (precisa da sua chave da API)
consumer_key = "IvHdPfXMtKePzxCJ99ajDBSO4"
consumer_secret = "3FSHTK32ZkFGjc8wFUP016rwhJRhsxs7xFE1AjReftp4FSqwle"
access_token = "1907166723310030848-NZViXbZYhXsC9D0o9zxVXZ87Rft9pu"
access_token_secret = "SVvouSOTuSWuj82XYuqkDGoqnn0Jqg3DhBgvNdSHngTQp"

# Conectar com o Twitter API usando Tweepy
def get_twitter_trends():
    auth = tweepy.OAuth1UserHandler(consumer_key, consumer_secret, access_token, access_token_secret)
    api = tweepy.API(auth)

    # Obter os tópicos em alta no Brasil (WOEID para o Brasil é 23424768)
    trends = api.get_place_trends(id=23424768)  # WOEID do Brasil
    trending_terms = []
    for trend in trends[0]["trends"]:
        trending_terms.append(trend["name"])  # Pegando apenas o nome dos tópicos

    return trending_terms[:10]  # Limitar a 10 termos

# Função para pegar termos relevantes dos RSS (Exemplo: Google News em Português)
def get_rss_trends():
    rss_url = "https://news.google.com/news/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419"  # Google News em Português
    feed = feedparser.parse(rss_url)
    
    rss_terms = []
    for entry in feed.entries[:10]:  # Pega as 10 últimas notícias
        title = entry.title
        # Limpar o título e pegar palavras-chave
        keywords = re.findall(r'\b\w+\b', title.lower())  # Pega palavras do título
        rss_terms.extend(keywords)
    
    return rss_terms[:20]  # Limitar a 20 termos para evitar excesso

# Função principal
def main():
    all_terms = []

    # Passo 1: Pegar dados do Twitter
    print("Puxando Twitter Trends...")
    twitter_terms = get_twitter_trends()
    all_terms.extend(twitter_terms)

    # Passo 2: Pegar dados do RSS (notícias)
    print("Puxando RSS News...")
    rss_terms = get_rss_trends()
    all_terms.extend(rss_terms)

    # Remover duplicados e limitar a 20 termos
    all_terms = list(dict.fromkeys(all_terms))[:20]

    if not all_terms:
        all_terms = ["Sem tendências disponíveis no momento."]

    # Salvar no arquivo JSON
    with open("data/trends.json", "w", encoding="utf-8") as f:
        json.dump(all_terms, f, ensure_ascii=False, indent=2)

    print("✅ trends.json atualizado com sucesso!")

# Rodar o script
if __name__ == "__main__":
    main()
