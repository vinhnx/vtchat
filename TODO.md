# TODO


fix RAG chat UI and avatar

--

combine RAG into main agent flow?

--
change "Plus" to "VT+" in the UI and documentation.

--

Console Error

Error: Subscription fetch timeout (5s)

Call Stack 4
SubscriptionProvider.useCallback[fetchSubscriptionStatus]
file:/Users/vinh.nguyenxuan/Developer/learn-by-doing/vtchat/apps/web/.next/static/chunks/packages_common_d6e0c1dd._.js (2330:39)
async*deduplicate
file:/Users/vinh.nguyenxuan/Developer/learn-by-doing/vtchat/apps/web/.next/static/chunks/packages_shared_b1ca5298._.js (2914:25)
SubscriptionProvider.useCallback[fetchSubscriptionStatus]
file:/Users/vinh.nguyenxuan/Developer/learn-by-doing/vtchat/apps/web/.next/static/chunks/packages_common_d6e0c1dd._.js (2287:216)
SubscriptionProvider.useEffect
file:/Users/vinh.nguyenxuan/Developer/learn-by-doing/vtchat/apps/web/.next/static/chunks/packages_common_d6e0c1dd._.js (2404:40)

--
--> Use RAG feature to build personal knowledge base and chat with it.

--> check openai customze ChatGPT for reference
https://chatgpt.com/#settings/Personalization
==

https://carousell.slack.com/archives/C017GMXG0MB/p1750653534510019

Hey, I found an easy way to cheese over GitHub Copilot (or even Cursor) premium request limits — just ask the LLM to run a command or use an MCP tool that pauses and asks for user input during or after every task execution.
For example: Asking the LLM to run this cmd after complete a task, so we can use it for another task.
read "prompt?Prompt: " && echo $prompt

--

Document search with embeddings
View on ai.google.dev 	Run in Google Colab 	View source on GitHub
Overview

This example demonstrates how to use the Gemini API to create embeddings so that you can perform document search. You will use the Python client library to build a word embedding that allows you to compare search strings, or questions, to document contents.

In this tutorial, you'll use embeddings to perform document search over a set of documents to ask questions related to the Google Car.
Prerequisites

You can run this quickstart in Google Colab.

To complete this quickstart on your own development environment, ensure that your environment meets the following requirements:

    Python 3.9+
    An installation of jupyter to run the notebook.

Setup

First, download and install the Gemini API Python library.

!pip install -U -q google-generativeai


import textwrap
import numpy as np
import pandas as pd

import google.generativeai as genai

# Used to securely store your API key
from google.colab import userdata

from IPython.display import Markdown

Grab an API Key

Before you can use the Gemini API, you must first obtain an API key. If you don't already have one, create a key with one click in Google AI Studio.

Get an API key

In Colab, add the key to the secrets manager under the "🔑" in the left panel. Give it the name API_KEY.

Once you have the API key, pass it to the SDK. You can do this in two ways:

    Put the key in the GOOGLE_API_KEY environment variable (the SDK will automatically pick it up from there).
    Pass the key to genai.configure(api_key=...)


# Or use `os.getenv('API_KEY')` to fetch an environment variable.
API_KEY=userdata.get('API_KEY')

genai.configure(api_key=API_KEY)


Key Point: Next, you will choose a model. Any embedding model will work for this tutorial, but for real applications it's important to choose a specific model and stick with it. The outputs of different models are not compatible with each other.

Note: At this time, the Gemini API is only available in certain regions.

for m in genai.list_models():
  if 'embedContent' in m.supported_generation_methods:
    print(m.name)


models/embedding-001
models/embedding-001

Embedding generation

In this section, you will see how to generate embeddings for a piece of text using the embeddings from the Gemini API.
API changes to Embeddings with model embedding-001

For the new embeddings model, embedding-001, there is a new task type parameter and the optional title (only valid with task_type=RETRIEVAL_DOCUMENT).

These new parameters apply only to the newest embeddings models.The task types are:
Task Type 	Description
RETRIEVAL_QUERY 	Specifies the given text is a query in a search/retrieval setting.
RETRIEVAL_DOCUMENT 	Specifies the given text is a document in a search/retrieval setting.
SEMANTIC_SIMILARITY 	Specifies the given text will be used for Semantic Textual Similarity (STS).
CLASSIFICATION 	Specifies that the embeddings will be used for classification.
CLUSTERING 	Specifies that the embeddings will be used for clustering.

Note: Specifying a title for RETRIEVAL_DOCUMENT provides better quality embeddings for retrieval.

title = "The next generation of AI for developers and Google Workspace"
sample_text = ("Title: The next generation of AI for developers and Google Workspace"
    "\n"
    "Full article:\n"
    "\n"
    "Gemini API & Google AI Studio: An approachable way to explore and prototype with generative AI applications")

model = 'models/embedding-001'
embedding = genai.embed_content(model=model,
                                content=sample_text,
                                task_type="retrieval_document",
                                title=title)

print(embedding)

Building an embeddings database

Here are three sample texts to use to build the embeddings database. You will use the Gemini API to create embeddings of each of the documents. Turn them into a dataframe for better visualization.

DOCUMENT1 = {
    "title": "Operating the Climate Control System",
    "content": "Your Googlecar has a climate control system that allows you to adjust the temperature and airflow in the car. To operate the climate control system, use the buttons and knobs located on the center console.  Temperature: The temperature knob controls the temperature inside the car. Turn the knob clockwise to increase the temperature or counterclockwise to decrease the temperature. Airflow: The airflow knob controls the amount of airflow inside the car. Turn the knob clockwise to increase the airflow or counterclockwise to decrease the airflow. Fan speed: The fan speed knob controls the speed of the fan. Turn the knob clockwise to increase the fan speed or counterclockwise to decrease the fan speed. Mode: The mode button allows you to select the desired mode. The available modes are: Auto: The car will automatically adjust the temperature and airflow to maintain a comfortable level. Cool: The car will blow cool air into the car. Heat: The car will blow warm air into the car. Defrost: The car will blow warm air onto the windshield to defrost it."}
DOCUMENT2 = {
    "title": "Touchscreen",
    "content": "Your Googlecar has a large touchscreen display that provides access to a variety of features, including navigation, entertainment, and climate control. To use the touchscreen display, simply touch the desired icon.  For example, you can touch the \"Navigation\" icon to get directions to your destination or touch the \"Music\" icon to play your favorite songs."}
DOCUMENT3 = {
    "title": "Shifting Gears",
    "content": "Your Googlecar has an automatic transmission. To shift gears, simply move the shift lever to the desired position.  Park: This position is used when you are parked. The wheels are locked and the car cannot move. Reverse: This position is used to back up. Neutral: This position is used when you are stopped at a light or in traffic. The car is not in gear and will not move unless you press the gas pedal. Drive: This position is used to drive forward. Low: This position is used for driving in snow or other slippery conditions."}

documents = [DOCUMENT1, DOCUMENT2, DOCUMENT3]


Organize the contents of the dictionary into a dataframe for better visualization.

df = pd.DataFrame(documents)
df.columns = ['Title', 'Text']
df

	Text
0 	Operating the Climate Control System Your Goo...
1 	Your Googlecar has a large touchscreen display...
2 	Shifting Gears Your Googlecar has an automati...

Get the embeddings for each of these bodies of text. Add this information to the dataframe.

# Get the embeddings of each text and add to an embeddings column in the dataframe
def embed_fn(title, text):
  return genai.embed_content(model=model,
                             content=text,
                             task_type="retrieval_document",
                             title=title)["embedding"]

df['Embeddings'] = df.apply(lambda row: embed_fn(row['Title'], row['Text']), axis=1)
df

	Text 	Embeddings
0 	Operating the Climate Control System Your Goo... 	[-0.016329883, -0.01747576, -0.038270127, -0.0...
1 	Your Googlecar has a large touchscreen display... 	[0.024793636, -0.024769256, -0.01176664, -0.04...
2 	Shifting Gears Your Googlecar has an automati... 	[-0.025426013, 0.00023183432, -0.02406427, -0....
Document search with Q&A

Now that the embeddings are generated, let's create a Q&A system to search these documents. You will ask a question about hyperparameter tuning, create an embedding of the question, and compare it against the collection of embeddings in the dataframe.

The embedding of the question will be a vector (list of float values), which will be compared against the vector of the documents using the dot product. This vector returned from the API is already normalized. The dot product represents the similarity in direction between two vectors.

The values of the dot product can range between -1 and 1, inclusive. If the dot product between two vectors is 1, then the vectors are in the same direction. If the dot product value is 0, then these vectors are orthogonal, or unrelated, to each other. Lastly, if the dot product is -1, then the vectors point in the opposite direction and are not similar to each other.

Note, with the new embeddings model (embedding-001), specify the task type as QUERY for user query and DOCUMENT when embedding a document text.
Task Type 	Description
RETRIEVAL_QUERY 	Specifies the given text is a query in a search/retrieval setting.
RETRIEVAL_DOCUMENT 	Specifies the given text is a document in a search/retrieval setting.

query = "How do you shift gears in the Google car?"
model = 'models/embedding-001'

request = genai.embed_content(model=model,
                              content=query,
                              task_type="retrieval_query")


Use the find_best_passage function to calculate the dot products, and then sort the dataframe from the largest to smallest dot product value to retrieve the relevant passage out of the database.

def find_best_passage(query, dataframe):
  """
  Compute the distances between the query and each document in the dataframe
  using the dot product.
  """
  query_embedding = genai.embed_content(model=model,
                                        content=query,
                                        task_type="retrieval_query")
  dot_products = np.dot(np.stack(dataframe['Embeddings']), query_embedding["embedding"])
  idx = np.argmax(dot_products)
  return dataframe.iloc[idx]['Text'] # Return text from index with max value


View the most relevant document from the database:

passage = find_best_passage(query, df)
passage


'Shifting Gears  Your Googlecar has an automatic transmission. To shift gears, simply move the shift lever to the desired position.  Park: This position is used when you are parked. The wheels are locked and the car cannot move. Reverse: This position is used to back up. Neutral: This position is used when you are stopped at a light or in traffic. The car is not in gear and will not move unless you press the gas pedal. Drive: This position is used to drive forward. Low: This position is used for driving in snow or other slippery conditions.'

Question and Answering Application

Let's try to use the text generation API to create a Q & A system. Input your own custom data below to create a simple question and answering example. You will still use the dot product as a metric of similarity.

def make_prompt(query, relevant_passage):
  escaped = relevant_passage.replace("'", "").replace('"', "").replace("\n", " ")
  prompt = textwrap.dedent("""You are a helpful and informative bot that answers questions using text from the reference passage included below. \
  Be sure to respond in a complete sentence, being comprehensive, including all relevant background information. \
  However, you are talking to a non-technical audience, so be sure to break down complicated concepts and \
  strike a friendly and converstional tone. \
  If the passage is irrelevant to the answer, you may ignore it.
  QUESTION: '{query}'
  PASSAGE: '{relevant_passage}'

    ANSWER:
  """).format(query=query, relevant_passage=escaped)

  return prompt


prompt = make_prompt(query, passage)
print(prompt)


You are a helpful and informative bot that answers questions using text from the reference passage included below.   Be sure to respond in a complete sentence, being comprehensive, including all relevant background information.   However, you are talking to a non-technical audience, so be sure to break down complicated concepts and   strike a friendly and converstional tone.   If the passage is irrelevant to the answer, you may ignore it.
  QUESTION: 'How do you shift gears in the Google car?'
  PASSAGE: 'Shifting Gears  Your Googlecar has an automatic transmission. To shift gears, simply move the shift lever to the desired position.  Park: This position is used when you are parked. The wheels are locked and the car cannot move. Reverse: This position is used to back up. Neutral: This position is used when you are stopped at a light or in traffic. The car is not in gear and will not move unless you press the gas pedal. Drive: This position is used to drive forward. Low: This position is used for driving in snow or other slippery conditions.'

    ANSWER:

Choose one of the Gemini content generation models in order to find the answer to your query.

for m in genai.list_models():
  if 'generateContent' in m.supported_generation_methods:
    print(m.name)


models/gemini-1.5-pro
models/gemini-1.5-flash


model = genai.GenerativeModel('gemini-1.5-pro-latest')
answer = model.generate_content(prompt)


Markdown(answer.text)


The provided passage does not contain information about how to shift gears in a Google car, so I cannot answer your question from this source.
Next steps

To learn how to use other services in the Gemini API, see the Python quickstart.

To learn more about how you can use embeddings, see these other tutorials:
https://github.com/google/generative-ai-docs/blob/main/site/en/gemini-api/tutorials/document_search.ipynb
--
add openai model and and open ai embedding model
--


move RAG Embedding Model and RAG Chat Model to VT+ setting section
--
Fix RAG Embedding Model and RAG Chat Model dropdown doesn't show the correct options properly. the dropdown is overlapped by the Settings modal.


--
@vtchat/web:dev: Database connection removed from pool
@vtchat/web:dev:  ○ Compiling /api/chat/rag ...
@vtchat/web:dev:  ✓ Compiled /api/chat/rag in 1776ms
@vtchat/web:dev: Query: insert into "resources" ("id", "user_id", "content", "created_at", "updated_at") values ($1, $2, $3, default, default) returning "id", "user_id", "content", "created_at", "updated_at" -- params: ["83e540d8-4d61-401c-acdd-7f6a54cf3c5c", "dc60d50d-9aac-47e7-8cb1-ce9000d28208", "My favorite food is pizza"]
@vtchat/web:dev: Database connection established
@vtchat/web:dev: Error creating resource: Error: OpenAI API key is required for OpenAI embeddings. Please add it in Settings → API Keys.
@vtchat/web:dev:     at generateEmbeddings (lib/ai/embedding.ts:96:18)
@vtchat/web:dev:     at createResource (lib/actions/resources.ts:41:58)
@vtchat/web:dev:   94 |         const openaiApiKey = apiKeys.OPENAI_API_KEY;
@vtchat/web:dev:   95 |         if (!openaiApiKey) {
@vtchat/web:dev: > 96 |             throw new Error('OpenAI API key is required for OpenAI embeddings. Please add it in Settings → API Keys.');
@vtchat/web:dev:      |                  ^
@vtchat/web:dev:   97 |         }
@vtchat/web:dev:   98 |
@vtchat/web:dev:   99 |         const modelConfig = EMBEDDING_MODEL_CONFIG[embeddingModel];
@vtchat/web:dev: Query: insert into "resources" ("id", "user_id", "content", "created_at", "updated_at") values ($1, $2, $3, default, default) returning "id", "user_id", "content", "created_at", "updated_at" -- params: ["6a155c5e-29fb-421f-ae2c-771ce0727e71", "dc60d50d-9aac-47e7-8cb1-ce9000d28208", "My favorite food is pizza"]
@vtchat/web:dev: Error creating resource: Error: OpenAI API key is required for OpenAI embeddings. Please add it in Settings → API Keys.
@vtchat/web:dev:     at generateEmbeddings (lib/ai/embedding.ts:96:18)
@vtchat/web:dev:     at createResource (lib/actions/resources.ts:41:58)
@vtchat/web:dev:   94 |         const openaiApiKey = apiKeys.OPENAI_API_KEY;
@vtchat/web:dev:   95 |         if (!openaiApiKey) {
@vtchat/web:dev: > 96 |             throw new Error('OpenAI API key is required for OpenAI embeddings. Please add it in Settings → API Keys.');
@vtchat/web:dev:      |                  ^
@vtchat/web:dev:   97 |         }
@vtchat/web:dev:   98 |
@vtchat/web:dev:   99 |         const modelConfig = EMBEDDING_MODEL_CONFIG[embeddingModel];
@vtchat/web:dev:  POST /api/chat/rag 200 in 6088ms
@vtchat/web:dev:  POST /api/chat/rag 200 in 2074ms
@vtchat/web:dev:  ○ Compiling /_not-found/page ...
@vtchat/web:dev:  GET /rag 200 in 644ms
@vtchat/web:dev:  ✓ Compiled /_not-found/page in 4.7s
@vtchat/web:dev:  GET /installHook.js.map 404 in 5238ms
@vtchat/web:dev: Database connection removed from pool

--

there seem to be inconsistent of retrieval model and embedding and apikey flow.
also, please make gemini embedding and models are default
--

sometime get auth and subscription failed

 Console Error

Error: Subscription fetch timeout (5s)

Call Stack 1
SubscriptionProvider.useCallback[fetchSubscriptionStatus]
file:/Users/vinh.nguyenxuan/Developer/learn-by-doing/vtchat/apps/web/.next/static/chunks/packages_common_d6e0c1dd._.js (2310:39)

--

https://next-safe-action.dev/
--
https://fluid.tw/#installation
--

## https://react-scan.com/

## https://requestindexing.com/

## https://og.new/

## https://unlighthouse.dev/

## https://million.dev/docs

https://page-speed.dev

--
https://github.com/e2b-dev/fragments

--
--

https://fly.io/docs/apps/going-to-production/
https://claude.ai/chat/524e3244-6d68-4f2a-9a74-4a4c281aba99
migrate from railway to fly.io
-> free if use under 5$ a month

--

https://ai-sdk.dev/cookbook/next/chat-with-pdf

--

railway: https://docs.railway.com/reference/production-readiness-checklist

--

<https://docs.creem.io/faq/account-reviews>

==

[]
remember to publish Google Auth
<https://console.cloud.google.com/auth/audience?authuser=6&inv=1&invt=Ab0LuQ&project=psyched-span-463012-h5>

--
[] Reddit marketing cheat codes every startup founder should know: <https://x.natiakourdadze/status/1933939677016228177>

--

[][monet] RAG <https://ai-sdk.dev/docs/guides/rag-chatbot>

--

<https://ai-sdk.dev/cookbook/node/web-search-agent#building-a-web-search-tool>

--

## Future

- [ ] Free tier: Continue using local IndexedDB for threads.
- [ ] [PLUS TIER ONLY] Implement full remote thread synchronization with Neon DB.
- [ ] [PLUS TIER ONLY] Sync threads to Neon DB.

--

- [ ] Electron: [https://github.com/electron/electron](https://github.com/electron/electron)

--

Domain:

-> vtchat.io.vn

- [ ] Domain Name Research (vtai.io.vn, vtchat.io.vn) - _Consider moving detailed notes to a separate research document._
    - Whois VN: [https://whois.inet.vn/whois?domain=vtchat.io.vn](https://whois.inet.vn/whois?domain=vtchat.io.vn)
    - VinaHost: [https://secure.vinahost.vn/ac/cart.php?a=confdomains](https://secure.vinahost.vn/ac/cart.php?a=confdomains)
    - <https://www.matbao.net/ten-mien/ket-qua-kiem-tra-ten-mien.html?tenmien=vtchat.io.vn#top_search>

--

[] grand final showcase <https://github.com/vercel/ai/discussions/1914>

--

Before final production deployment, ensure all environment variables are set correctly for production, including API keys, database URLs, and any other sensitive information.

- [ ] Finalize production environment configuration:
- [ ] Ensure all environment variables are set correctly for production, including API keys, database URLs, and any other sensitive information.
- [ ] Test the production deployment thoroughly to ensure all features work as expected.
- [ ] Set up monitoring and logging for the production environment to catch any issues early
- [ ] Document the production deployment process for future reference.
- [ ] Create a final checklist for production deployment, including:
    - [ ] Environment variable verification
    - [ ] Database connection checks
    - [ ] API key validation
    - [ ] Feature testing
    - [ ] Monitoring setup
- [ ] Review and finalize the production deployment documentation, ensuring it is clear and comprehensive for future deployments.
- [ ] Conduct a final review of the codebase to ensure all changes are committed and pushed to the main branch.
- [ ] Prepare a final release note summarizing the changes, features, and fixes included in the production deployment.
- [ ] Schedule a final deployment date and time, ensuring all team members are aware and available for any last-minute issues that may arise.

--

Write a final report and update readme, documentation, and any other relevant materials to reflect the current state of the project.

--

Good luck!
