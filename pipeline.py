from agents import build_reader_agent , build_search_agent , writer_chain , critic_chain

def run_research_pipeline(topic : str) -> dict:

    state = {}

    #search agent working 
    print("\n"+" ="*50)
    print("step 1 - search agent is working ...")
    print("="*50)

    search_agent = build_search_agent()
    search_result = search_agent.invoke({
        "messages" : [("user", f"Find recent, reliable and detailed information about: {topic}")]
    })
    state["search_results"] = search_result['messages'][-1].content

    print("\n search result ",state['search_results'])

    #step 2 - reader agent 
    print("\n"+" ="*50)
    print("step 2 - Reader agent is scraping top resources ...")
    print("="*50)

    reader_agent = build_reader_agent()
    reader_result = reader_agent.invoke({
        "messages": [("user",
            f"Based on the following search results about '{topic}', "
            f"pick the most relevant URL and scrape it for deeper content.\n\n"
            f"Search Results:\n{state['search_results'][:800]}"
        )]
    })

    state['scraped_content'] = reader_result['messages'][-1].content

    print("\nscraped content: \n", state['scraped_content'])

    #step 3 - writer chain 

    print("\n"+" ="*50)
    print("step 3 - Writer is drafting the report ...")
    print("="*50)

    research_combined = (
        f"SEARCH RESULTS : \n {state['search_results']} \n\n"
        f"DETAILED SCRAPED CONTENT : \n {state['scraped_content']}"
    )

    state["report"] = writer_chain.invoke({
        "topic" : topic,
        "research" : research_combined
    })

    print("\n Final Report\n",state['report'])

    #critic report 

    print("\n"+" ="*50)
    print("step 4 - critic is reviewing the report ")
    print("="*50)

    state["feedback"] = critic_chain.invoke({
        "report":state['report']
    })

    print("\n critic report \n", state['feedback'])

    return state


async def stream_research_pipeline(topic: str):
    import asyncio
    state = {}
    loop = asyncio.get_event_loop()

    # 1. Search Agent
    yield {
        "event": "status",
        "agent": "search_agent",
        "status": "running",
        "message": f"Search agent: Searching the web for '{topic}'..."
    }

    try:
        search_agent = build_search_agent()
        search_result = await loop.run_in_executor(
            None,
            lambda: search_agent.invoke({
                "messages": [("user", f"Find recent, reliable and detailed information about: {topic}")]
            })
        )
        state["search_results"] = search_result['messages'][-1].content
        yield {
            "event": "search_results",
            "agent": "search_agent",
            "status": "completed",
            "content": state["search_results"]
        }
    except Exception as e:
        yield {
            "event": "status",
            "agent": "search_agent",
            "status": "error",
            "message": f"Search agent failed: {str(e)}"
        }
        return

    # 2. Reader Agent
    yield {
        "event": "status",
        "agent": "reader_agent",
        "status": "running",
        "message": "Reader agent: Scraping top resources for deeper content..."
    }

    try:
        reader_agent = build_reader_agent()
        reader_result = await loop.run_in_executor(
            None,
            lambda: reader_agent.invoke({
                "messages": [("user",
                    f"Based on the following search results about '{topic}', "
                    f"pick the most relevant URL and scrape it for deeper content.\n\n"
                    f"Search Results:\n{state['search_results'][:800]}"
                )]
            })
        )
        state['scraped_content'] = reader_result['messages'][-1].content
        yield {
            "event": "scraped_content",
            "agent": "reader_agent",
            "status": "completed",
            "content": state["scraped_content"]
        }
    except Exception as e:
        yield {
            "event": "status",
            "agent": "reader_agent",
            "status": "error",
            "message": f"Reader agent failed: {str(e)}"
        }
        return

    # 3. Writer Chain
    yield {
        "event": "status",
        "agent": "writer_chain",
        "status": "running",
        "message": "Writer agent: Drafting the comprehensive report..."
    }

    research_combined = (
        f"SEARCH RESULTS : \n {state['search_results']} \n\n"
        f"DETAILED SCRAPED CONTENT : \n {state['scraped_content']}"
    )

    try:
        full_report = ""
        async for chunk in writer_chain.astream({
            "topic": topic,
            "research": research_combined
        }):
            full_report += chunk
            yield {
                "event": "report_chunk",
                "agent": "writer_chain",
                "content": chunk
            }

        state["report"] = full_report
        yield {
            "event": "status",
            "agent": "writer_chain",
            "status": "completed",
            "message": "Writer agent finished drafting report."
        }
    except Exception as e:
        yield {
            "event": "status",
            "agent": "writer_chain",
            "status": "error",
            "message": f"Writer agent failed: {str(e)}"
        }
        return

    # 4. Critic Chain
    yield {
        "event": "status",
        "agent": "critic_chain",
        "status": "running",
        "message": "Critic agent: Reviewing and scoring the report..."
    }

    try:
        full_feedback = ""
        async for chunk in critic_chain.astream({
            "report": state['report']
        }):
            full_feedback += chunk
            yield {
                "event": "critic_chunk",
                "agent": "critic_chain",
                "content": chunk
            }

        state["feedback"] = full_feedback
        yield {
            "event": "status",
            "agent": "critic_chain",
            "status": "completed",
            "message": "Critic agent completed review."
        }
    except Exception as e:
        yield {
            "event": "status",
            "agent": "critic_chain",
            "status": "error",
            "message": f"Critic agent failed: {str(e)}"
        }
        return

    # Complete
    yield {
        "event": "status",
        "agent": "system",
        "status": "completed",
        "message": "All agents have completed their tasks."
    }


if __name__ == "__main__":
    topic = input("\n Enter a research topic : ")
    run_research_pipeline(topic)